/* SPDX-License-Identifier: MIT. Original playback and wheel helpers. */
(function (scope) {
  'use strict';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function angleDelta(next, previous) {
    let delta = next - previous;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return delta;
  }
  function clock(seconds) {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    return Math.floor(value / 60) + ':' + String(value % 60).padStart(2, '0');
  }
  function clickSamples(sampleRate) {
    const samples = new Float32Array(Math.ceil(sampleRate * .018));
    let seed = 73;
    for (let i = 0; i < samples.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const time = i / sampleRate;
      samples[i] = ((seed / 4294967296 * 2 - 1) * .55 + Math.sin(time * 2 * Math.PI * 2600) * .45) * Math.exp(-time * 420) * .18;
    }
    return samples;
  }
  class Playback {
    constructor({ AudioClass = scope.Audio, contextFactory, onError = () => {} } = {}) {
      this.audio = new AudioClass();
      this.audio.preload = 'metadata';
      this.audio.setAttribute('playsinline', '');
      this.queue = []; this.index = -1; this.volume = .8; this.shuffle = false; this.repeat = 'off';
      this.contextFactory = contextFactory || (() => new (scope.AudioContext || scope.webkitAudioContext)());
      this.onError = onError; this.listeners = new Set(); this.generation = 0;
      for (const event of ['timeupdate', 'loadedmetadata', 'durationchange', 'play', 'pause']) this.audio.addEventListener(event, () => this.emit());
      this.audio.addEventListener('ended', () => {
        if (this.repeat === 'one') { this.audio.currentTime = 0; this.resume(); }
        else if (this.shuffle || this.index + 1 < this.queue.length || this.repeat === 'all') this.skipNext();
        else this.emit();
      });
      this.audio.addEventListener('error', () => { this.emit(); this.onError(this.audio.error); });
    }
    get state() {
      return { queue: this.queue, currentTrackIndex: this.index, isPlaying: !this.audio.paused && !this.audio.ended,
        currentPlaybackTime: this.audio.currentTime || 0, currentPlaybackDuration: Number.isFinite(this.audio.duration) ? this.audio.duration : 0, volume: this.volume };
    }
    subscribe(callback) { this.listeners.add(callback); callback(this.state); return () => this.listeners.delete(callback); }
    emit() { const state = this.state; for (const callback of this.listeners) callback(state); }
    resumeAudio() {
      // Called synchronously inside the user's tap, before any network or storage await.
      try {
        if (!this.context) {
          this.context = this.contextFactory(); this.gain = this.context.createGain();
          this.source = this.context.createMediaElementSource(this.audio);
          this.source.connect(this.gain).connect(this.context.destination);
          this.gain.gain.value = this.volume;
        }
        if (this.context.state === 'suspended' || this.context.state === 'interrupted') this.context.resume().catch(() => {});
      } catch (_) { try { this.audio.volume = this.volume; } catch (_) {} }
    }
    play(queue, index = 0) {
      if (!queue.length || !queue[index]) return;
      this.resumeAudio(); this.queue = queue.slice(); this.index = index; this.generation++;
      this.audio.src = this.queue[this.index].previewUrl;
      this.emit(); this.resume();
    }
    resume() {
      if (!this.queue[this.index]) return;
      this.resumeAudio(); const generation = this.generation;
      try { const promise = this.audio.play(); if (promise) promise.catch(error => { if (generation === this.generation && error.name !== 'AbortError') this.onError(error); }); }
      catch (error) { this.onError(error); }
    }
    pause() { this.audio.pause(); }
    toggle() { if (this.audio.paused || this.audio.ended) this.resume(); else this.pause(); }
    skipNext() {
      if (!this.queue.length) return;
      let next = (this.index + 1) % this.queue.length;
      if (this.shuffle && this.queue.length > 1) next = (this.index + 1 + Math.floor(Math.random() * (this.queue.length - 1))) % this.queue.length;
      this.play(this.queue, next);
    }
    skipPrevious() { if (this.audio.currentTime > 3) this.seek(0); else if (this.queue.length) this.play(this.queue, (this.index + this.queue.length - 1) % this.queue.length); }
    seek(value) { if (Number.isFinite(this.audio.duration)) { this.audio.currentTime = clamp(value, 0, this.audio.duration); this.emit(); } }
    setVolume(value) { this.volume = clamp(value, 0, 1); if (this.gain) this.gain.gain.value = this.volume; else { try { this.audio.volume = this.volume; } catch (_) {} } this.emit(); }
    click() {
      this.resumeAudio(); if (!this.context || this.context.state !== 'running') return;
      try {
        if (!this.clickBuffer) {
          const samples = clickSamples(this.context.sampleRate);
          this.clickBuffer = this.context.createBuffer(2, samples.length, this.context.sampleRate);
          this.clickBuffer.getChannelData(0).set(samples); this.clickBuffer.getChannelData(1).set(samples);
        }
        const source = this.context.createBufferSource(); source.buffer = this.clickBuffer;
        source.connect(this.context.destination); source.start();
      } catch (_) {}
    }
    destroy() { this.generation++; this.audio.pause(); this.audio.removeAttribute('src'); this.audio.load(); this.listeners.clear(); if (this.context) this.context.close().catch(() => {}); }
  }
  const api = { Playback, angleDelta, clock, clickSamples, clamp };
  scope.PlayerCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
