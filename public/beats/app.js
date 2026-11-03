if(new URLSearchParams(location.search).has('card'))document.documentElement.classList.add('embedded');
/* Apple iPod Web Player v0.3.1 */
(async function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const Music = window.LocalMusic;
  const messages = {
    'zh-CN': {
      eyebrow:'你的音乐，随身而行。',headline:'好音乐。<br>转动之间。',description:'熟悉的滚轮，熟悉的感觉。<br>Alex Infield 的 Original Tracks。',import:'添加音乐',folder:'选择文件夹',privacy:'也可以将音乐拖入这里。文件只留在这台设备上。',emptyDetail:'从你喜爱的第一首开始。',manage:'管理',demo:'先听一段演示',original:'原创合成音',reimagined:'经典，重新转动。',wheelHint:'沿滚轮转动以浏览，按中央键选择。',footer:'一点怀旧，全部是你的音乐。',install:'添加到主屏幕',drop:'把音乐放在这里。',helpTitle:'让熟悉的手感回来。',helpFoot:'本地实验项目，与 Apple 无关联。音乐文件不会上传。',library:'本地曲库',addMore:'继续添加',clear:'清空曲库',unknownArtist:'未知歌手',allSongs:'所有本地音乐',empty:'还没有音乐',count:n=>`${n} 首音乐`,saved:'已保存在当前浏览器 · 可以离线播放',temporary:'部分音乐仅在本次打开时可用',restoring:'正在读取本地曲库…',importing:(n,total)=>`正在导入 ${n} / ${total}…`,imported:n=>`已添加 ${n} 首音乐`,duplicate:'这些音乐已经在曲库中。',noAudio:'没有找到可导入的音频文件。',storageWarning:'浏览器存储不可用或空间不足，未保存的音乐可在本次打开时播放。',cleared:'曲库已清空。原始音乐文件不受影响。',clearConfirm:'清空此浏览器内的曲库副本？不会删除原始音乐文件。',error:'这首音乐暂时无法播放，请尝试浏览器支持的 MP3 或 WAV 文件。',demoName:'转动之间',demoArtist:'Original Tracks · 原创演示',demoAlbum:'First Spin',demoReady:'原创演示已加入曲库。进入 Songs / 歌曲并按中央键播放。',installTip:'iPhone / iPad：在 Safari 中点“分享”→“添加到主屏幕”。Android / 桌面：在浏览器菜单中选择“安装应用”。需要 HTTPS 或本机 localhost。',fullscreenTip:'已进入沉浸模式。若浏览器仍显示地址栏，可通过“添加到主屏幕”独立打开。',helpRows:[['滚轮','鼠标按住环形滚轮转动；手机上用手指沿圆环滑动。'],['中央键','进入菜单或播放歌曲。播放时按中央键切换进度与音量。'],['MENU','返回上一层；长按切换屏幕背光。'],['播放控制','底部播放 / 暂停，两侧切歌；长按两侧快进 / 快退。'],['键盘','聚焦播放器后：↑ ↓ 浏览，Enter 选择，Esc 返回。'],['移动全屏','右上角进入沉浸 / 全屏。iPhone 建议通过 Safari 添加到主屏幕。'],['音乐与存储','MP3 优先；其他格式取决于浏览器。MP3 标签会自动读取。曲库保存在当前浏览器，清理网站数据会移除副本。'],['手机访问','手机需要打开此应用的 HTTPS 地址或电脑提供的局域网地址；手机 localhost 指向手机自身。']]
    },
    en: {
      eyebrow:'YOUR MUSIC. ALONG FOR THE RIDE.',headline:'Good music.<br> One little wheel.',description:'A familiar wheel. A familiar feeling.<br> Original Tracks by Alex Infield.',import:'Add music',folder:'Choose folder',privacy:'Or drop your music here. Your files stay on this device.',emptyDetail:'Start with a song you love.',manage:'Manage',demo:'Take it for a spin',original:'ORIGINAL DEMO',reimagined:'A CLASSIC, REWOUND.',wheelHint:'Turn the wheel to browse. Press the center to choose.',footer:'A little nostalgia. All your music.',install:'Add to Home Screen',drop:'Drop your music here.',helpTitle:'Get that familiar feeling.',helpFoot:'A local experiment. Not affiliated with Apple. Your music is never uploaded.',library:'YOUR LOCAL LIBRARY',addMore:'Add more',clear:'Clear library',unknownArtist:'Unknown Artist',allSongs:'All local music',empty:'No music yet',count:n=>`${n} ${n===1?'song':'songs'}`,saved:'Saved in this browser · Ready for offline listening',temporary:'Some tracks are available only in this session',restoring:'Opening your local library…',importing:(n,total)=>`Importing ${n} / ${total}…`,imported:n=>`Added ${n} ${n===1?'song':'songs'}`,duplicate:'These tracks are already in your library.',noAudio:'No supported audio files were selected.',storageWarning:'Browser storage is unavailable or full. Unsaved tracks will work for this session.',cleared:'Library cleared. Your original files are unchanged.',clearConfirm:'Clear the music copies in this browser? Your original files will not be deleted.',error:'This track could not be played. Try an MP3 or WAV file supported by your browser.',demoName:'One Little Wheel',demoArtist:'Original Tracks · Original Demo',demoAlbum:'First Spin',demoReady:'Original demo added. Open Songs, then press the center button to play.',installTip:'iPhone / iPad: Safari → Share → Add to Home Screen. Android / desktop: choose Install app in the browser menu. Requires HTTPS or localhost.',fullscreenTip:'Player view is on. If browser bars remain visible, use Add to Home Screen to open it on its own.',helpRows:[['The wheel','Click and drag around the ring. On your phone, trace the ring with your finger.'],['Center','Choose a menu item or play a song. While playing, press to switch between seeking and volume.'],['MENU','Go back one level. Hold to toggle the backlight.'],['Playback','Bottom: play / pause. Sides: previous / next. Hold a side to rewind / fast-forward.'],['Keyboard','Focus the player: ↑ ↓ to browse, Enter to choose, Esc to go back.'],['Mobile view','Top-right opens immersive / fullscreen view. On iPhone, add it to your Home Screen from Safari.'],['Files & storage','MP3 is a good starting point. Other codecs depend on your browser. MP3 tags are read automatically. Clearing site data removes saved copies.'],['On your phone','Open this app over HTTPS or a LAN address served by your computer. A phone’s localhost refers to the phone itself.']]
    }
  };
  Object.assign(messages['zh-CN'],{demo:'播放 Original Tracks',original:'Alex Infield',manage:'曲库',clear:'清空导入音乐',clearConfirm:'清空此浏览器内导入的音乐副本？预置测试音乐和原始文件会保留。',footer:'独立学习项目，与 Apple 无关联。',helpFoot:'原创实现，MIT 开源。导入的音乐不会上传。',demoReady:'测试音乐可直接播放，也可从播放器的“歌曲”菜单中选择。'});
  Object.assign(messages.en,{demo:'Play Original Tracks',original:'Alex Infield',manage:'Library',clear:'Clear imported music',clearConfirm:'Clear imported music copies in this browser? The included test track and original files will stay.',footer:'Independent educational project. Not affiliated with Apple.',helpFoot:'Original implementation, MIT licensed. Imported music is never uploaded.',demoReady:'Play the included test track, or choose it from Songs on the player.'});
  Object.assign(messages['zh-CN'],{compare:'素材与许可',helpFoot:'独立开发的学习项目，与 Apple 无关联。字体及素材许可见页脚说明，导入音乐不会上传。'});
  Object.assign(messages.en,{compare:'Credits & licenses',helpFoot:'An independent educational project, not affiliated with Apple. See the footer for font and artwork licenses. Imports are never uploaded.'});
  let language = 'zh-CN';
  try { language = localStorage.getItem('ipod-player-language') || (navigator.language.startsWith('zh') ? 'zh-CN' : 'en'); } catch (_) {}
  if (!messages[language]) language = 'en';
  let records = []; let data = { songs:[], artists:[], playlists:[] }; let db; let storageOK = true; let busy = false; let toastTimer; let installPrompt; let playbackUnsubscribe; let mountGeneration = 0;
  let ipod = $('ipod'); let deviceReady = false; let cacheReady = false; let screenObserver;
  const t = key => messages[language][key];
  const screenChinese = {
    'Menu.Playlists':'播放列表','Menu.Artists':'歌手','Menu.Songs':'歌曲','Menu.Settings':'设置','Menu.NowPlaying':'正在播放','Menu.All':'全部','Menu.AllSongs':'全部歌曲','Menu.NoMusic':'暂无音乐',
    'Settings.About':'关于','Settings.Shuffle':'随机播放','Settings.Repeat':'重复播放','Settings.BacklightTimer':'背光时间','Settings.Clicker':'按键音','Settings.ResetAllSettings':'重置设置','Settings.Value.Off':'关','Settings.Value.On':'开','Settings.Value.Songs':'歌曲','Settings.Value.One':'单曲','Settings.Value.All':'全部',
    'Backlight.Off':'关闭','Backlight.OneSecond':'1 秒','Backlight.TwoSeconds':'2 秒','Backlight.ThreeSeconds':'3 秒','Backlight.FiveSeconds':'5 秒','Backlight.AlwaysOn':'常亮','Reset.Cancel':'取消','Reset.Reset':'重置','About.Songs':'歌曲','About.Capacity':'容量','About.Available':'可用','About.Version':'版本',
    'NowPlaying.Position':'@@index@@ / @@total@@','NowPlaying.ShuffleOn':'随机播放','NowPlaying.RepeatOne':'单曲循环','NowPlaying.RepeatAll':'全部循环','NowPlaying.ShuffleOnRepeatOne':'随机播放，单曲循环','NowPlaying.ShuffleOnRepeatAll':'随机播放，全部循环','NowPlaying.PlaybackProgress':'播放进度','NowPlaying.Volume':'音量',
    'Wheel.Menu':'菜单','Wheel.Back':'上一首','Wheel.Forward':'下一首','Wheel.Play':'播放','Wheel.Pause':'暂停','Wheel.Select':'选择','Game.Title':'打砖块','Game.GameOver':'游戏结束','Game.LaunchBall':'按中央键发球','Status.Loading':'正在加载','Status.Ready':'已就绪','Error.NotConnected':'本地音乐播放器'
  };
  function setScreenLanguage() {
    if (!ipod) return;
    ipod.lang=language;
    ipod.locale={storefront:'local',language:language==='en'?'en-US':'zh-CN'};
    ipod.i18n={t(key,values){if(language!=='zh-CN')return undefined;const value=screenChinese[key.replace('ASE.Web.IPod.','')];return value&&value.replace(/@@(\w+)@@/g,(_,name)=>values&&name in values?String(values[name]):'');}};
  }
  function markCjkText(root) {
    for(const element of root.querySelectorAll('.screen-title,.item-title,.item-value,.song-title,.artist,.album')) {
      element.toggleAttribute('data-cjk-text',/[\u2e80-\u9fff\uf900-\ufaff]/.test(element.textContent));
    }
  }
  function toast(text, duration = 4600) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, duration); }
  function setBusy(value) { busy = value; for (const id of ['import-files','import-folder','demo','add-more','focus-import','clear-library']) $(id).disabled = value; }
  function showDialog(id) { const dialog=$(id); if (dialog.open) return; if (dialog.showModal) dialog.showModal(); else { dialog.setAttribute('open',''); dialog.style.position='fixed'; dialog.style.zIndex='50'; dialog.style.inset='10% auto auto 50%'; dialog.style.transform='translateX(-50%)'; } }
  function closeDialog(dialog) { if(dialog.close) dialog.close(); else dialog.removeAttribute('open'); }
  function renderLanguage() {
    document.documentElement.lang=language;
    for (const element of document.querySelectorAll('[data-i18n]')) {
      const value=t(element.dataset.i18n);
      if(element.dataset.i18n==='headline'||element.dataset.i18n==='description') element.innerHTML=value;
      else element.textContent=value;
    }
    $('language').textContent=language==='zh-CN'?'EN':'中文'; $('language').setAttribute('aria-label',language==='zh-CN'?'Switch to English':'切换为中文');
    $('help').setAttribute('aria-label',language==='zh-CN'?'使用说明':'Help'); $('focus').setAttribute('aria-label',language==='zh-CN'?'沉浸与全屏':'Player view / fullscreen'); $('focus-import').setAttribute('aria-label',t('import')); $('focus-exit').setAttribute('aria-label',language==='zh-CN'?'退出沉浸模式':'Exit player view');
    $('help-content').replaceChildren();
    for (const [title,body] of t('helpRows')) { const row=document.createElement('div');row.className='help-row';const strong=document.createElement('strong');strong.textContent=title;const p=document.createElement('p');p.textContent=body;row.append(strong,p);$('help-content').append(row); }
    setScreenLanguage();
    $('offline-state').textContent=cacheReady?(language==='zh-CN'?'· 页面已缓存':'· APP CACHED'):'';
    refreshLibrary();
  }
  function refreshLibrary() {
    data=Music.groupLibrary(records,{language,unknownArtist:t('unknownArtist'),allSongs:t('allSongs')});
    const store=deviceReady && ipod.iPodDataStore;
    if(store) store.set({status:'ready',language,data});
    $('library-count').textContent=records.length?t('count')(records.length):t('empty');
    const hosted=records.filter(record=>record.hosted).length,local=records.length-hosted;
    $('library-detail').textContent=records.length?(language==='zh-CN'?`预置 ${hosted} 首 · 本地导入 ${local} 首`:`${hosted} included · ${local} imported`)+(local?' · '+(storageOK?t('saved'):t('temporary')):''):t('emptyDetail');
    $('manage-title').textContent=records.length?t('count')(records.length):t('empty');
    $('storage-status').textContent=storageOK?t('saved'):t('temporary');
    $('clear-library').disabled=busy||!local;
    renderTracks();
  }
  function renderTracks() {
    const list=$('track-list');list.replaceChildren();
    if(!data.songs.length) {const li=document.createElement('li');li.className='empty-library';li.textContent=t('emptyDetail');list.append(li);return;}
    data.songs.forEach((song,index)=>{
      const li=document.createElement('li');const number=document.createElement('span');number.className='track-number';number.textContent=String(index+1).padStart(2,'0');
      const info=document.createElement('div');info.className='track-info';const title=document.createElement('p');title.textContent=song.name;const artist=document.createElement('p');artist.textContent=song.artistName;info.append(title,artist);
      const play=document.createElement('button');play.type='button';play.className='icon-button';play.textContent='▷';play.setAttribute('aria-label',(language==='zh-CN'?'播放 ':'Play ')+song.name);
      play.addEventListener('click',()=>{ const player=deviceReady&&ipod.localPlaybackStore; if(player){ player.resumeAudio(); player.play(data.songs,index); ipod.showNowPlaying();closeDialog($('library-dialog')); ipod.focus(); } });
      li.append(number,info,play);list.append(li);
    });
  }
  function mediaSession(state) {
    if(!('mediaSession' in navigator)) return;
    try { const song=state.queue[state.currentTrackIndex]; if(song&&window.MediaMetadata) navigator.mediaSession.metadata=new MediaMetadata({title:song.name,artist:song.artistName,album:song.albumName,artwork:(art=>art?[{src:art,sizes:'600x600',type:'image/jpeg'}]:[])(records.find(record=>record.id===song.id)?.artwork)});navigator.mediaSession.playbackState=state.isPlaying?'playing':'paused';
      if(navigator.mediaSession.setPositionState&&state.currentPlaybackDuration>0) navigator.mediaSession.setPositionState({duration:state.currentPlaybackDuration,playbackRate:1,position:Math.min(state.currentPlaybackTime,state.currentPlaybackDuration)});
    } catch (_) {}
  }
  async function connectDevice() {
    const generation=++mountGeneration;
    deviceReady=false;
    await customElements.whenDefined('web-music-ipod');
    for(let attempt=0;attempt<80;attempt++) {
      if(generation!==mountGeneration) return;
      try { if(ipod.iPodDataStore&&ipod.localPlaybackStore) {deviceReady=true;break;} } catch (_) { /* Svelte custom elements mount on the next turn. */ }
      await new Promise(resolve=>setTimeout(resolve,30));
    }
    if(!deviceReady) {toast(language==='zh-CN'?'播放器初始化失败，请刷新页面。':'Player could not start. Please reload.');return;}
    setScreenLanguage();
    if(screenObserver)screenObserver.disconnect();
    if(ipod.shadowRoot) {
      const root=ipod.shadowRoot,style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./screen.css',document.baseURI).href;root.append(style);
      let frame;
      screenObserver=new MutationObserver(()=>{if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>markCjkText(root));});
      screenObserver.observe(root,{childList:true,characterData:true,subtree:true});
      markCjkText(root);
    }
    refreshLibrary();
    if(playbackUnsubscribe) playbackUnsubscribe();
    const player=ipod.localPlaybackStore;
    if(player) {playbackUnsubscribe=player.subscribe(mediaSession);if('mediaSession' in navigator){for(const [action,callback] of Object.entries({play:()=>{player.resumeAudio();player.resume();},pause:()=>player.pause(),previoustrack:()=>player.skipPrevious(),nexttrack:()=>player.skipNext(),seekto:event=>player.seek(event.seekTime)})){try{navigator.mediaSession.setActionHandler(action,callback);}catch(_){}}}}
    fitDevice();
  }
  function fitDevice() {
    const embedded=new URLSearchParams(location.search).has('card'); const immersive=document.body.classList.contains('focus-mode'); const space=$('device-space');const stage=$('stage');
    let scale;
    if(embedded) scale=Math.min((stage.clientWidth-24)/520,(innerHeight-24)/600,.9);
    else if(immersive) scale=Math.min((stage.clientWidth-10)/520,(stage.clientHeight-8)/600,1.4);
    else {
      const width=stage.clientWidth;
      const referenceScale=width<360?.75:width<400?.8:.9;
      scale=Math.min(referenceScale,(width-12)/520);
    }
    scale=Math.max(.15,scale);space.style.width=(520*scale)+'px';space.style.height=(600*scale)+'px';$('device-wrap').style.transform='scale('+scale+')';
    const reflection=0;space.style.marginBottom=reflection+'px';document.querySelector('main').style.setProperty('--reflection-space',reflection+'px');
  }
  async function importFiles(files) {
    if(busy) return;const candidates=Array.from(files).filter(Music.isAudio);if(!candidates.length){toast(t('noAudio'));return;}
    setBusy(true);let added=0;let saveFailed=false;const ids=new Set(records.map(record=>record.id));
    try {
      for(let index=0;index<candidates.length;index++) {
        const file=candidates[index];const id=Music.recordId(file);if(ids.has(id)) continue;
        $('library-count').textContent=t('importing')(index+1,candidates.length);
        const metadata=await Music.readMetadata(file);const record={id,...metadata,size:file.size,type:file.type,blob:file,lastModified:file.lastModified||0};
        record.url=URL.createObjectURL(file);records.push(record);ids.add(id);added++;
        if(db){try{const saved={...record};delete saved.url;await Music.databaseAction(db,'readwrite',store=>store.put(saved));}catch(_){storageOK=false;saveFailed=true;}}else{storageOK=false;saveFailed=true;}
        if(index%8===0) await new Promise(resolve=>setTimeout(resolve,0));
      }
      toast(added?t('imported')(added):t('duplicate'));
    } catch(_){toast(t('storageWarning'));}
    finally{setBusy(false);refreshLibrary();$('files').value='';$('folder').value='';if(saveFailed)toast(t('storageWarning'),6500);}
  }
  function loadDemo() {
    if(busy||!deviceReady)return;
    const player=ipod.localPlaybackStore;player.resumeAudio();
    let song=data.songs.find(song=>song.id.startsWith('hosted:'))||data.songs.find(song=>song.id==='demo-first-spin');
    if(!song){const blob=Music.createDemo();records.push({id:'demo-first-spin',name:t('demoName'),artistName:t('demoArtist'),albumName:t('demoAlbum'),blob,size:blob.size,type:'audio/wav',url:URL.createObjectURL(blob)});storageOK=false;refreshLibrary();song=data.songs.find(song=>song.id==='demo-first-spin');}
    // Do not await fetch/IndexedDB before audio.play(): preserve iOS user activation.
    player.play(data.songs,data.songs.indexOf(song));ipod.showNowPlaying();
  }
  function setFocus(value){document.body.classList.toggle('focus-mode',value);requestAnimationFrame(fitDevice);}
  async function enterFullscreen(){setFocus(true);try{const element=document.documentElement;if(element.requestFullscreen)await element.requestFullscreen();else if(element.webkitRequestFullscreen)element.webkitRequestFullscreen();else toast(t('fullscreenTip'),7000);}catch(_){toast(t('fullscreenTip'),7000);}}
  async function leaveFocus(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)document.webkitExitFullscreen();}catch(_){}setFocus(false);}
  $('import-files').addEventListener('click',()=>$('files').click());$('focus-import').addEventListener('click',()=>$('files').click());$('add-more').addEventListener('click',()=>$('files').click());$('import-folder').addEventListener('click',()=>$('folder').click());
  if(!('webkitdirectory' in $('folder'))) $('import-folder').hidden=true;
  $('files').addEventListener('change',event=>importFiles(event.target.files));$('folder').addEventListener('change',event=>importFiles(event.target.files));
  $('demo').addEventListener('click',loadDemo);$('help').addEventListener('click',()=>showDialog('help-dialog'));$('library-open').addEventListener('click',()=>showDialog('library-dialog'));$('focus').addEventListener('click',enterFullscreen);$('focus-exit').addEventListener('click',leaveFocus);
  $('language').addEventListener('click',()=>{language=language==='zh-CN'?'en':'zh-CN';try{localStorage.setItem('ipod-player-language',language);}catch(_){}renderLanguage();});
  for(const button of document.querySelectorAll('.close-dialog'))button.addEventListener('click',()=>closeDialog(button.closest('dialog')));
  for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);}});
  $('clear-library').addEventListener('click',async()=>{if(busy||!records.length||!confirm(t('clearConfirm')))return;setBusy(true);try{if(db)await Music.databaseAction(db,'readwrite',store=>store.clear());}catch(_){setBusy(false);toast(t('storageWarning'));return;}
    if(playbackUnsubscribe)playbackUnsubscribe();const old=ipod;if(deviceReady&&old.localPlaybackStore)old.localPlaybackStore.pause();deviceReady=false;ipod=document.createElement('web-music-ipod');ipod.id='ipod';old.replaceWith(ipod);for(const record of records)if(!record.hosted)URL.revokeObjectURL(record.url);records=records.filter(record=>record.hosted);storageOK=!!db;setBusy(false);refreshLibrary();await connectDevice();toast(t('cleared'));
  });
  let dragDepth=0;
  window.addEventListener('dragenter',event=>{if(event.dataTransfer&&Array.from(event.dataTransfer.types).includes('Files')){event.preventDefault();dragDepth++;$('drop-overlay').hidden=false;}});
  window.addEventListener('dragover',event=>{if(event.dataTransfer&&Array.from(event.dataTransfer.types).includes('Files'))event.preventDefault();});
  window.addEventListener('dragleave',()=>{if(--dragDepth<=0){dragDepth=0;$('drop-overlay').hidden=true;}});
  window.addEventListener('drop',event=>{event.preventDefault();dragDepth=0;$('drop-overlay').hidden=true;if(event.dataTransfer)importFiles(event.dataTransfer.files);});
  window.addEventListener('ipod-playback-error',()=>toast(t('error'),7000));
  const scheduleFit=()=>requestAnimationFrame(fitDevice);
  window.addEventListener('resize',scheduleFit);window.addEventListener('orientationchange',scheduleFit);if(window.visualViewport)window.visualViewport.addEventListener('resize',scheduleFit);
  if(window.ResizeObserver)new ResizeObserver(scheduleFit).observe($('stage'));
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('focus-mode'))fitDevice();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]')&&!document.fullscreenElement)setFocus(false);});
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
  $('install').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}else toast(t('installTip'),10000);});
  const standalone=matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone;
  if(standalone||new URLSearchParams(location.search).get('mode')==='player')setFocus(true);
  renderLanguage();setBusy(true);$('library-count').textContent=t('restoring');
  await connectDevice();
  const restored=await Promise.allSettled([
    (async()=>{db=await Music.openDatabase();const saved=await Music.databaseAction(db,'readonly',store=>store.getAll());return(saved||[]).filter(record=>record.blob instanceof Blob).map(record=>({...record,url:URL.createObjectURL(record.blob)}));})(),
    HostedCatalog.load(document.baseURI)
  ]);
  if(restored[0].status==='fulfilled')records.push(...restored[0].value);else storageOK=false;
  if(restored[1].status==='fulfilled')records.push(...restored[1].value);else toast(language==='zh-CN'?'预置曲库暂不可用，仍可导入本地音乐或播放合成演示。':'Included catalog is unavailable. Import music or play the synthesized demo.');
  setBusy(false);refreshLibrary();
  /* Original Tracks: no service worker; sw.js is not shipped. */
})();
