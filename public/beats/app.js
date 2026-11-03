if(new URLSearchParams(location.search).has('card'))document.documentElement.classList.add('embedded');
/* Original Tracks: hosted recordings only. Upstream licence: LICENSE. */
(async function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const Music = window.LocalMusic;
  const messages = {
    en:{eyebrow:'ORIGINAL TRACKS',headline:'Original music.<br>One little wheel.',description:'Three recordings by Alex Infield.',emptyDetail:'Choose a recording from Songs.',manage:'Library',reimagined:'Original Tracks',wheelHint:'Turn the wheel to browse. Press the center to choose.',footer:'An independent music player.',install:'Add to Home Screen',helpTitle:'Using the player',helpFoot:'The included recordings remain on this site.',library:'Recordings',unknownArtist:'Unknown Artist',allSongs:'All recordings',empty:'No recordings available',count:n=>`${n} ${n===1?'recording':'recordings'}`,error:'This recording could not be played.',installTip:'Use your browser’s Add to Home Screen command.',fullscreenTip:'Player view is on. Use Add to Home Screen to open it on its own.',compare:'Credits & licenses',play:'Play recordings',original:'Alex Infield',helpRows:[['The wheel','Click and drag around the ring. On your phone, trace the ring with your finger.'],['Center','Choose a menu item or play a recording. While playing, press to switch between seeking and volume.'],['MENU','Return to the previous menu.'],['Playback','Bottom: play / pause. Sides: previous / next.'],['Keyboard','Focus the player: ↑ ↓ to browse, Enter to choose, Esc to return.']]},
    'zh-CN':{eyebrow:'ORIGINAL TRACKS',headline:'原创音乐。<br>转动之间。',description:'Alex Infield 的三首原创录音。',emptyDetail:'在“歌曲”菜单中选择录音。',manage:'曲库',reimagined:'Original Tracks',wheelHint:'沿滚轮转动以浏览，按中央键选择。',footer:'独立音乐播放器。',install:'添加到主屏幕',helpTitle:'使用播放器',helpFoot:'所含录音来自本站。',library:'录音',unknownArtist:'未知歌手',allSongs:'所有录音',empty:'暂无录音',count:n=>`${n} 首录音`,error:'这首录音暂时无法播放。',installTip:'请使用浏览器的“添加到主屏幕”功能。',fullscreenTip:'已进入播放器模式。',compare:'素材与许可',play:'播放录音',original:'Alex Infield',helpRows:[['滚轮','鼠标按住环形滚轮转动；手机上用手指沿圆环滑动。'],['中央键','进入菜单或播放录音。播放时按中央键切换进度与音量。'],['MENU','返回上一层。'],['播放控制','底部播放 / 暂停，两侧切歌。'],['键盘','聚焦播放器后：↑ ↓ 浏览，Enter 选择，Esc 返回。']]}
  };
  let language = 'zh-CN';
  try { language = localStorage.getItem('ipod-player-language') || (navigator.language.startsWith('zh') ? 'zh-CN' : 'en'); } catch (_) {}
  if (!messages[language]) language = 'en';
  let records = []; let data = { songs:[], artists:[], playlists:[] }; let busy = false; let toastTimer; let installPrompt; let playbackUnsubscribe; let mountGeneration = 0;
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
  function setBusy(value) { busy = value; for (const id of ['play-recordings']) $(id).disabled = value; }
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
    $('help').setAttribute('aria-label',language==='zh-CN'?'使用说明':'Help'); $('focus').setAttribute('aria-label',language==='zh-CN'?'沉浸与全屏':'Player view / fullscreen'); $('focus-exit').setAttribute('aria-label',language==='zh-CN'?'退出沉浸模式':'Exit player view');
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
    $('library-detail').textContent='Original Tracks · Alex Infield';
    $('manage-title').textContent=t('library');
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
  function playRecordings(){
    if(busy||!deviceReady||!data.songs.length)return;
    const player=ipod.localPlaybackStore;player.resumeAudio();player.play(data.songs,0);ipod.showNowPlaying();
  }
  function setFocus(value){document.body.classList.toggle('focus-mode',value);requestAnimationFrame(fitDevice);}
  async function enterFullscreen(){setFocus(true);try{const element=document.documentElement;if(element.requestFullscreen)await element.requestFullscreen();else if(element.webkitRequestFullscreen)element.webkitRequestFullscreen();else toast(t('fullscreenTip'),7000);}catch(_){toast(t('fullscreenTip'),7000);}}
  async function leaveFocus(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)document.webkitExitFullscreen();}catch(_){}setFocus(false);}
  $('play-recordings').addEventListener('click',playRecordings);$('help').addEventListener('click',()=>showDialog('help-dialog'));$('library-open').addEventListener('click',()=>showDialog('library-dialog'));$('focus').addEventListener('click',enterFullscreen);$('focus-exit').addEventListener('click',leaveFocus);
  $('language').addEventListener('click',()=>{language=language==='zh-CN'?'en':'zh-CN';try{localStorage.setItem('ipod-player-language',language);}catch(_){}renderLanguage();});
  for(const button of document.querySelectorAll('.close-dialog'))button.addEventListener('click',()=>closeDialog(button.closest('dialog')));
  for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);}});
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
  renderLanguage();setBusy(true);$('library-count').textContent=t('empty');
  await connectDevice();
  try{records=await HostedCatalog.load(document.baseURI);}catch{toast(t('empty'));}
  setBusy(false);refreshLibrary();
  /* Original Tracks: no service worker; sw.js is not shipped. */
})();
