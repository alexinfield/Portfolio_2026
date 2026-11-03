/* SPDX-License-Identifier: MIT. Inline hosted-recording adapter; notices: NOTICE.txt. */
(() => {
  const jobs=new Map();let font;
  function script(url){if(jobs.has(url))return jobs.get(url);const promise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.async=true;s.onload=resolve;s.onerror=()=>{jobs.delete(url);reject(Error('Player asset unavailable'));};document.head.append(s);});jobs.set(url,promise);return promise;}
  async function assets(base,versions){
    const at=name=>new URL(name,base).href+'?v='+versions[name];
    if(font?.status==='error'){document.fonts.delete(font);font=undefined;}
    if(!font){font=new FontFace('ChicagoKare',`url("${at('appearance/ChicagoKare.woff2')}")`,{weight:'400',style:'normal'});document.fonts.add(font);}
    await Promise.all([font.load(),script(at('range.js'))]);
    await Promise.all(['player-core.js','appearance/player-artwork.js','library.js','catalog.js'].map(name=>script(at(name))));
    window.OriginalTracksStyleVersions=versions;await script(at('wheel-player.js'));
  }
  async function mount(host,{base,versions,catalog}){
    base=new URL(base,location.href).href;await assets(base,versions);
    const records=HostedCatalog.parseCatalog(catalog,base),data=LocalMusic.groupLibrary(records,{language:'en',unknownArtist:'Unknown Artist',allSongs:'All recordings'});
    const element=document.createElement('original-tracks-player');element.lang=document.documentElement.lang||'en';element.setAttribute('aria-label','Original Tracks music player');
    Object.assign(element.style,{position:'absolute',left:'0',top:'0',transformOrigin:'top left'});host.replaceChildren(element);
    element.recordingsStore.set({status:'ready',data});
    const fit=()=>{element.style.transform=`scale(${host.clientWidth/415})`;};fit();const observer=new ResizeObserver(fit);observer.observe(host);
    try{
      await Promise.all([...element.shadowRoot.querySelectorAll('link[rel=stylesheet]')].map(link=>link.sheet?Promise.resolve():new Promise((resolve,reject)=>{link.onload=resolve;link.onerror=reject;})));
      await document.fonts.load('26px ChicagoKare');
    }catch(error){observer.disconnect();element.remove();throw error;}
    const unsubscribe=element.localPlaybackStore.subscribe(state=>{
      if(!('mediaSession'in navigator))return;const song=state.queue[state.currentTrackIndex];
      try{if(song&&window.MediaMetadata)navigator.mediaSession.metadata=new MediaMetadata({title:song.name,artist:song.artistName,album:song.albumName});navigator.mediaSession.playbackState=state.isPlaying?'playing':'paused';}catch{/* optional platform metadata */}
    });
    return {element,destroy(){observer.disconnect();unsubscribe();element.remove();}};
  }
  window.OriginalTracks={mount};
})();
