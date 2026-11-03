import https from 'node:https';
import {createReadStream} from 'node:fs';
import {mkdtemp,readFile,stat,rm,chmod} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {tmpdir} from 'node:os';
import {resolve,join,extname,sep} from 'node:path';
const run=promisify(execFile);
// Ephemeral loopback TLS only. No trust installation, credentials or publication.
export async function serveExport(directory){
 const root=resolve(directory),scratch=await mkdtemp(join(tmpdir(),'portfolio-checks-'));
 const key=join(scratch,'local.key'),cert=join(scratch,'local.crt');
 await run('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-subj','/CN=localhost','-days','1']);await chmod(key,0o600);
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.webp':'image/webp','.avif':'image/avif','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm','.m4a':'audio/mp4','.ico':'image/x-icon'};
 const server=https.createServer({key:await readFile(key),cert:await readFile(cert)},async(req,res)=>{
  try{let path=decodeURIComponent(new URL(req.url,'https://localhost').pathname);let file=resolve(root,'.'+path);if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
   let info=await stat(file).catch(()=>null);if(info?.isDirectory()){if(!path.endsWith('/')){res.writeHead(301,{location:path+'/'}).end();return;}file=join(file,'index.html');info=await stat(file).catch(()=>null);}
   let status=200;if(!info?.isFile()){file=join(root,'404.html');info=await stat(file);status=404;}
   const headers={'content-type':types[extname(file)]||'application/octet-stream','accept-ranges':'bytes','cache-control':'no-store'},range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');let start=0,end=info.size-1;
   if(range&&status===200){start=+range[1];end=Math.min(range[2]?+range[2]:end,end);if(start>end){res.writeHead(416,{'content-range':`bytes */${info.size}`}).end();return;}status=206;headers['content-range']=`bytes ${start}-${end}/${info.size}`;}
   headers['content-length']=Math.max(0,end-start+1);res.writeHead(status,headers);if(req.method==='HEAD'||!info.size){res.end();return;}const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }catch{if(!res.headersSent)res.writeHead(404);res.end();}
 });
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 return {origin:`https://127.0.0.1:${server.address().port}`,close:async()=>{server.closeAllConnections();await new Promise(done=>server.close(done));await rm(scratch,{recursive:true,force:true});}};
}
