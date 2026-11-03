/* SPDX-License-Identifier: MIT. Original player, vector artwork and interaction. */
(function () {
  'use strict';
  const words = {
    en: { playlists:'Playlists', artists:'Artists', songs:'Songs', settings:'Settings', now:'Now Playing', empty:'No music yet', all:'All Songs', shuffle:'Shuffle', repeat:'Repeat', click:'Clicker', light:'Backlight', about:'About', on:'On', off:'Off', one:'One', reset:'Reset settings', unknown:'Unknown Artist', volume:'Volume', seek:'Playback progress', menu:'Back / MENU', select:'Select', previous:'Previous track', next:'Next track', toggle:'Play / pause', hint:'Use arrow keys, Enter, Escape, or turn the wheel.', of:'of' },
    zh: { playlists:'播放列表', artists:'艺人', songs:'歌曲', settings:'设置', now:'正在播放', empty:'暂无音乐', all:'所有歌曲', shuffle:'随机播放', repeat:'重复播放', click:'按键音', light:'屏幕背光', about:'关于', on:'开', off:'关', one:'单曲', reset:'重置设置', unknown:'未知歌手', volume:'音量', seek:'播放进度', menu:'返回 / MENU', select:'选择', previous:'上一首', next:'下一首', toggle:'播放 / 暂停', hint:'可用方向键、Enter、Escape，或沿圆环转动。', of:'/' }
  };
  const css = `:host{display:block;width:520px;height:600px;outline:none}`;
  class WheelPlayer extends HTMLElement {
    constructor() {
      super(); this.attachShadow({mode:'open'}); this._data={songs:[],artists:[],playlists:[]}; this.view={type:'root',index:0}; this.stack=[]; this.clicker=true; this.backlight=true; this.mode='seek';
      this._player=new PlayerCore.Playback({onError:()=>window.dispatchEvent(new CustomEvent('ipod-playback-error'))});
      this._store={set:value=>{if(value.data)this._data=value.data;this.render();}};
      this.shadowRoot.innerHTML=`<style>${css}</style><link rel="stylesheet" href="./appearance/player-materials.css"><link rel="stylesheet" href="./appearance/adapter.css"><div class="surface"><div class="shell ipod-container"><div class="bezel ipod-screen backlit"><div class="lcd menu-layer menu"><div class="titlebar menu-title"><span class="playing play-icon"></span><span class="title screen-title">Original Tracks</span><span class="battery battery-indicator" aria-hidden="true">${PlayerArtwork.battery}</span></div><div class="body screen-body"></div></div></div><div class="wheel click-wheel"><button class="key wheel-button menu-button" data-action="menu">${PlayerArtwork.menu}</button><button class="key wheel-button back-button" data-action="previous">${PlayerArtwork.skip}</button><button class="key wheel-button forward-button" data-action="next">${PlayerArtwork.skip}</button><button class="key wheel-button playpause-button" data-action="toggle">${PlayerArtwork.toggle}</button><div class="wheel-dividers" aria-hidden="true"></div><div class="scroll-wheel" aria-hidden="true"></div><button class="key select-button" data-action="select"></button></div></div></div>`;
      this._player.audio.hidden=true;this.shadowRoot.append(this._player.audio);
      this.wheel=this.shadowRoot.querySelector('.wheel'); this.body=this.shadowRoot.querySelector('.body');
      if(!CSS.supports('-webkit-box-reflect','below 4px')){this.reflected=this.shadowRoot.querySelector('.shell').cloneNode(true);const reflection=document.createElement('div');reflection.className='reflection-fallback';reflection.setAttribute('aria-hidden','true');reflection.inert=true;for(const button of this.reflected.querySelectorAll('button')){button.disabled=true;button.tabIndex=-1;}reflection.append(this.reflected);this.shadowRoot.querySelector('.surface').append(reflection);}
      this._unsubscribe=this._player.subscribe(state=>{const before=this.playing;this.playing=state.isPlaying;this.state=state;if(this.view.type==='now')this.renderNow();else if(before!==this.playing)this.render();});
      this.wheel.addEventListener('click',event=>{const action=event.target.closest('button')?.dataset.action;if(!action)return;if(this.suppressClick){this.suppressClick=false;return;}this.action(action);});
      this.wheel.addEventListener('pointerdown',event=>this.pointerStart(event));
      this.wheel.addEventListener('pointermove',event=>this.pointerMove(event));
      for(const name of ['pointerup','pointercancel','lostpointercapture'])this.wheel.addEventListener(name,()=>this.pointerEnd());
      this.wheel.addEventListener('wheel',event=>{event.preventDefault();this.rotate(Math.sign(event.deltaY));},{passive:false});
      this.addEventListener('keydown',event=>{
        const actions={ArrowUp:()=>this.rotate(-1),ArrowDown:()=>this.rotate(1),Enter:()=>this.action('select'),Escape:()=>this.action('menu'),' ':()=>this.action('toggle'),ArrowLeft:()=>this.action('previous'),ArrowRight:()=>this.action('next')};
        if(actions[event.key]){event.preventDefault();event.stopPropagation();actions[event.key]();}
      });
    }
    connectedCallback(){if(!this.hasAttribute('tabindex'))this.tabIndex=0;this.setAttribute('role','group');this.render();}
    disconnectedCallback(){this.pointerEnd();this._unsubscribe();this._player.destroy();}
    get iPodDataStore(){return this._store;}
    get localPlaybackStore(){return this._player;}
    showNowPlaying(){if(this.view.type!=='now')this.navigate('now');else this.render();}
    set locale(value){this._language=value?.language;this.render();}
    get text(){return words[(this._language||this.lang||'en').startsWith('zh')?'zh':'en'];}
    sound(){if(this.clicker)this._player.click();}
    navigate(type,id,title){this.stack.push({...this.view});this.view={type,id,title,index:0};this.render();}
    list(){
      const t=this.text,d=this._data,p=this._player,entry=(name,run,value)=>({name,run,value});
      if(this.view.type==='root')return [entry(t.playlists,()=>this.navigate('playlists')),entry(t.artists,()=>this.navigate('artists')),entry(t.songs,()=>this.navigate('songs')),entry(t.settings,()=>this.navigate('settings')),...(p.queue.length?[entry(t.now,()=>this.navigate('now'))]:[])];
      if(this.view.type==='artists'||this.view.type==='playlists')return d[this.view.type].map(item=>entry(item.name,()=>this.navigate('songs',item.id,item.name)));
      if(this.view.type==='songs'){
        const group=[...d.artists,...d.playlists].find(item=>item.id===this.view.id);
        const songs=group?group.songIds.map(id=>d.songs.find(song=>song.id===id)).filter(Boolean):d.songs;
        return songs.map((song,index)=>entry(song.name,()=>{p.play(songs,index);this.navigate('now');}));
      }
      if(this.view.type==='settings')return [entry(t.shuffle,()=>{p.shuffle=!p.shuffle;this.render();},p.shuffle?t.on:t.off),entry(t.repeat,()=>{p.repeat=['off','all','one'][(['off','all','one'].indexOf(p.repeat)+1)%3];this.render();},t[p.repeat]),entry(t.click,()=>{this.clicker=!this.clicker;this.render();},this.clicker?t.on:t.off),entry(t.light,()=>{this.backlight=!this.backlight;this.render();},this.backlight?t.on:t.off),entry(t.about,()=>this.navigate('about')),entry(t.reset,()=>{p.shuffle=false;p.repeat='off';p.setVolume(.8);this.backlight=true;this.clicker=true;this.render();})];
      return [];
    }
    action(action){
      this.focus({preventScroll:true});this.sound();const p=this._player;
      if(action==='select'){if(this.view.type==='now'){this.mode=this.mode==='seek'?'volume':'seek';this.renderNow();}else this.list()[this.view.index]?.run();}
      if(action==='menu'){if(this.view.type==='root'&&p.queue.length)this.navigate('now');else this.view=this.stack.pop()||{type:'root',index:0};this.render();}
      if(action==='toggle'){if(p.queue.length)p.toggle();else if(this._data.songs.length){p.play(this._data.songs,0);this.navigate('now');}}
      if(action==='previous')p.skipPrevious();if(action==='next')p.skipNext();
    }
    rotate(step){
      if(!step)return;this.sound();if(this.view.type==='now'){if(this.mode==='volume')this._player.setVolume(this._player.volume+step*.04);else this._player.seek(this._player.audio.currentTime+step*3);return;}
      const count=this.list().length;if(!count)return;this.view.index=PlayerCore.clamp(this.view.index+step,0,count-1);this.render();
    }
    pointerStart(event){
      if(event.button!==0)return;this.suppressClick=false;this.focus({preventScroll:true});this._player.resumeAudio();
      const target=event.target.closest('button');if(target?.dataset.action==='select')return;
      const rect=this.wheel.getBoundingClientRect();this.drag={id:event.pointerId,cx:rect.left+rect.width/2,cy:rect.top+rect.height/2,last:Math.atan2(event.clientY-rect.top-rect.height/2,event.clientX-rect.left-rect.width/2),sum:0,moved:0};
      event.target.setPointerCapture(event.pointerId);
      if(target?.dataset.action==='menu')this.hold=setTimeout(()=>{this.backlight=!this.backlight;this.suppressClick=true;this.render();},650);
      else if(['previous','next'].includes(target?.dataset.action))this.hold=setTimeout(()=>{this.suppressClick=true;this.seekHold=setInterval(()=>this._player.seek(this._player.audio.currentTime+(target.dataset.action==='next'?3:-3)),180);},650);
    }
    pointerMove(event){
      if(!this.drag||this.drag.id!==event.pointerId)return;const d=this.drag,angle=Math.atan2(event.clientY-d.cy,event.clientX-d.cx),change=PlayerCore.angleDelta(angle,d.last);d.last=angle;d.sum+=change;d.moved+=Math.abs(change);
      if(d.moved>.14){clearTimeout(this.hold);clearInterval(this.seekHold);this.suppressClick=true;}
      if(Math.abs(d.sum)>.24){const steps=Math.trunc(d.sum/.24);d.sum-=steps*.24;this.rotate(PlayerCore.clamp(steps,-8,8));}
    }
    pointerEnd(){clearTimeout(this.hold);clearInterval(this.seekHold);this.drag=null;}
    render(){
      if(!this.body)return;const t=this.text;
      this.setAttribute('aria-label','Original Tracks. '+t.hint);
      const labels={menu:t.menu,select:t.select,previous:t.previous,next:t.next,toggle:t.toggle};for(const button of this.wheel.querySelectorAll('button'))button.setAttribute('aria-label',labels[button.dataset.action]);
      this.shadowRoot.querySelector('.bezel').classList.toggle('backlit',this.backlight);this.updateIndicator();
      const title=this.shadowRoot.querySelector('.title');title.textContent=this.view.title||({root:'Original Tracks',songs:t.songs,artists:t.artists,playlists:t.playlists,settings:t.settings,now:t.now,about:t.about}[this.view.type]||'Original Tracks');title.toggleAttribute('data-cjk-text',/[\u2e80-\u9fff\uf900-\ufaff]/.test(title.textContent));
      if(this.view.type==='now'){this.renderNow();return;}
      this.body.replaceChildren();
      if(this.view.type==='about'){const box=document.createElement('div');box.className='about';for(const line of ['Original Tracks','Alex Infield',this._data.songs.length+' '+t.songs,'Independent player']){const p=document.createElement('p');p.textContent=line;box.append(p);}this.body.append(box);this.syncReflection();return;}
      const items=this.list();this.view.index=PlayerCore.clamp(this.view.index,0,Math.max(0,items.length-1));
      if(!items.length){const empty=document.createElement('p');empty.className='empty';empty.textContent=t.empty;this.body.append(empty);this.syncReflection();return;}
      const list=document.createElement('div');list.className='list menu-items';this.body.append(list);
      const start=Math.max(0,Math.min(this.view.index-4,items.length-5));
      for(let index=start;index<Math.min(start+5,items.length);index++){
        const item=items[index],row=document.createElement('button'),name=document.createElement('span'),end=document.createElement('span');row.type='button';row.className='row menu-item'+(index===this.view.index?' selected':'');row.setAttribute('aria-current',index===this.view.index?'true':'false');name.className='name item-title';name.textContent=item.name;row.toggleAttribute('data-cjk-row',/[\u2e80-\u9fff\uf900-\ufaff]/.test(item.name+(item.value||'')));end.className=item.value?'value item-value':'chevron';end.textContent=item.value||'';end.setAttribute('aria-hidden',item.value?'false':'true');row.append(name,end);row.addEventListener('click',()=>{this.view.index=index;this.sound();item.run();});list.append(row);
      }
      this.syncReflection();
    }
    updateIndicator(){const state=this.state||this._player.state;this.shadowRoot.querySelector('.playing').innerHTML=state.queue.length?(state.isPlaying?PlayerArtwork.indicatorPlay:PlayerArtwork.indicatorPause):'';}
    syncReflection(){if(!this.reflected)return;this.reflected.querySelector('.body').innerHTML=this.body.innerHTML;this.reflected.querySelector('.title').textContent=this.shadowRoot.querySelector('.title').textContent;this.reflected.querySelector('.playing').innerHTML=this.shadowRoot.querySelector('.playing').innerHTML;this.reflected.querySelector('.bezel').className=this.shadowRoot.querySelector('.bezel').className;for(const button of this.reflected.querySelectorAll('button')){button.disabled=true;button.tabIndex=-1;}}
    renderNow(){
      const state=this.state||this._player.state,song=state.queue[state.currentTrackIndex],t=this.text;if(!song){this.view={type:'root',index:0};this.render();return;}
      if(!this.body.querySelector('.now'))this.body.innerHTML='<div class="now"><div class="position"></div><div class="song song-title"></div><div class="artist"></div><div class="album"></div><div class="meter"><div class="fill"></div></div><div class="times"><span></span><span></span></div><div class="mode"></div></div>';
      const set=(selector,value)=>{this.body.querySelector(selector).textContent=value;};set('.position',(state.currentTrackIndex+1)+' '+t.of+' '+state.queue.length);set('.song',song.name);set('.artist',song.artistName||t.unknown);set('.album',song.albumName||' ');
      const volume=this.mode==='volume',duration=state.currentPlaybackDuration,ratio=volume?this._player.volume:(duration?state.currentPlaybackTime/duration:0);
      this.body.querySelector('.fill').style.width=PlayerCore.clamp(ratio*100,0,100)+'%';const times=this.body.querySelector('.times');times.firstElementChild.textContent=volume?t.volume:PlayerCore.clock(state.currentPlaybackTime);times.lastElementChild.textContent=volume?Math.round(this._player.volume*100)+'%':'−'+PlayerCore.clock(duration-state.currentPlaybackTime);set('.mode',volume?t.volume:t.seek);this.updateIndicator();this.syncReflection();
    }
  }
  customElements.define('web-music-ipod',WheelPlayer);
})();
