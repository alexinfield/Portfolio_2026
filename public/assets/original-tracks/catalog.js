/* SPDX-License-Identifier: MIT. Same-site static recording catalog. */
(function(scope){
  'use strict';
  function parseCatalog(value,base){
    if(value?.version!==1||!Array.isArray(value.tracks)||value.tracks.length>500)throw new Error('Invalid catalog');
    const root=new URL('./',base),ids=new Set();
    return value.tracks.map(track=>{
      if(!track||typeof track.id!=='string'||!/^[\w-]{1,80}$/.test(track.id)||ids.has(track.id))throw new Error('Invalid or duplicate track ID');
      if(typeof track.url!=='string'||/^[a-z][a-z\d+.-]*:|^\/|\\/i.test(track.url))throw new Error('Only relative same-site tracks are allowed');
      const url=new URL(track.url,root);
      if(url.origin!==root.origin||!url.pathname.startsWith(root.pathname)||url.search||url.hash||url.username||url.password)throw new Error('Track outside this player');
      if(typeof track.name!=='string'||!track.name.trim()||track.name.length>500)throw new Error('Invalid title');
      let artwork='';
      if(track.artwork!==undefined){if(typeof track.artwork!=='string'||/^[a-z][a-z\d+.-]*:|^\/|\\/i.test(track.artwork))throw new Error('Only relative same-site artwork is allowed');const art=new URL(track.artwork,root);if(art.origin!==root.origin||!art.pathname.startsWith(root.pathname)||art.search||art.hash)throw new Error('Artwork outside this player');artwork=art.href;}
      ids.add(track.id);
      return {id:'hosted:'+track.id,name:track.name,artistName:String(track.artist||'').slice(0,500),albumName:String(track.album||'').slice(0,500),url:url.href,type:String(track.type||''),artwork,hosted:true};
    });
  }
  async function load(base){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);
    try{const response=await fetch(new URL('./tracks.json',base),{signal:controller.signal,credentials:'same-origin'});if(!response.ok)throw new Error('Catalog HTTP '+response.status);return parseCatalog(await response.json(),base);}
    finally{clearTimeout(timer);}
  }
  const api={parseCatalog,load};scope.HostedCatalog=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
