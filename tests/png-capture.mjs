// Minimal PNG decoder for Chromium screenshots (8-bit RGB/RGBA, non-interlaced).
import {inflateSync,deflateSync} from 'node:zlib';
export function decodePng(buf){
  let pos=8,width,height,colorType,idat=[];
  while(pos<buf.length){
    const len=buf.readUInt32BE(pos),type=buf.toString('latin1',pos+4,pos+8),data=buf.subarray(pos+8,pos+8+len);
    if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);if(data[8]!==8||data[12]!==0)throw Error('unsupported png');colorType=data[9];}
    else if(type==='IDAT')idat.push(data);
    else if(type==='IEND')break;
    pos+=12+len;
  }
  const bpp=colorType===6?4:colorType===2?3:null;if(!bpp)throw Error('color type '+colorType);
  const raw=inflateSync(Buffer.concat(idat)),stride=width*bpp,out=Buffer.alloc(width*height*3);
  let prev=Buffer.alloc(stride),cur=Buffer.alloc(stride);
  for(let y=0;y<height;y++){
    const f=raw[y*(stride+1)],line=raw.subarray(y*(stride+1)+1,(y+1)*(stride+1));
    for(let x=0;x<stride;x++){
      const a=x>=bpp?cur[x-bpp]:0,b=prev[x],c=x>=bpp?prev[x-bpp]:0;let v=line[x];
      if(f===1)v+=a;else if(f===2)v+=b;else if(f===3)v+=(a+b)>>1;
      else if(f===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);v+=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
      cur[x]=v&255;
    }
    for(let x=0;x<width;x++){const o=(y*width+x)*3;out[o]=cur[x*bpp];out[o+1]=cur[x*bpp+1];out[o+2]=cur[x*bpp+2];}
    [prev,cur]=[cur,prev];
  }
  return {width,height,data:out,px:(x,y)=>{const o=(y*width+x)*3;return [out[o],out[o+1],out[o+2]];}};
}

const table=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let n=0;n<8;n++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function chunk(type,data){const name=Buffer.from(type),body=Buffer.concat([name,data]);let crc=0xffffffff;for(const byte of body)crc=table[(crc^byte)&255]^(crc>>>8);const out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);name.copy(out,4);data.copy(out,8);out.writeUInt32BE((crc^0xffffffff)>>>0,out.length-4);return out;}
export function encodePng({width,height,data}){const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;const stride=width*3,raw=Buffer.alloc((stride+1)*height);for(let y=0;y<height;y++)data.copy(raw,y*(stride+1)+1,y*stride,(y+1)*stride);return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw,{level:6})),chunk('IEND',Buffer.alloc(0))]);}
