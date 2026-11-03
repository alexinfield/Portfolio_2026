/* Apple iPod Web Player v0.3.1 — local library and bounded MP3 tag reading. */
(function (scope) {
  'use strict';
  const EXTENSIONS = /\.(mp3|m4a|aac|wav|flac|ogg|opus|webm|aif|aiff)$/i;
  function isAudio(file) { return !!file && (EXTENSIONS.test(file.name) || /^audio\//.test(file.type || '')); }
  function syncSafe(bytes, offset) { return ((bytes[offset] & 127) * 2097152) + ((bytes[offset + 1] & 127) << 14) + ((bytes[offset + 2] & 127) << 7) + (bytes[offset + 3] & 127); }
  function clean(text) { return text.replace(/\u0000/g, '').trim().slice(0, 500); }
  function decodeText(bytes) {
    if (!bytes.length) return '';
    const encoding = bytes[0]; let data = bytes.subarray(1); let name = 'windows-1252';
    if (encoding === 1) {
      name = data[0] === 254 && data[1] === 255 ? 'utf-16be' : 'utf-16le';
      if ((data[0] === 255 && data[1] === 254) || (data[0] === 254 && data[1] === 255)) data = data.subarray(2);
    } else if (encoding === 2) name = 'utf-16be';
    else if (encoding === 3) name = 'utf-8';
    try { return clean(new TextDecoder(name).decode(data)); } catch (_) { return ''; }
  }
  function parseID3(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const result = {};
    if (bytes.length < 10 || bytes[0] !== 73 || bytes[1] !== 68 || bytes[2] !== 51) return result;
    const version = bytes[3];
    if (version < 2 || version > 4 || (bytes[5] & 128)) return result; // Unsynchronised tags fall back to the filename.
    const end = Math.min(bytes.length, 10 + syncSafe(bytes, 6)); let offset = 10;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (bytes[5] & 64) {
      if (version === 2 || offset + 4 > end) return result;
      offset += version === 4 ? syncSafe(bytes, offset) : view.getUint32(offset) + 4;
    }
    const fields = { TIT2: 'name', TT2: 'name', TPE1: 'artistName', TP1: 'artistName', TALB: 'albumName', TAL: 'albumName' };
    let frames = 0;
    while (offset + (version === 2 ? 6 : 10) <= end && frames++ < 2048) {
      const short = version === 2; const header = short ? 6 : 10;
      const id = String.fromCharCode.apply(null, bytes.subarray(offset, offset + (short ? 3 : 4)));
      if (!/^[A-Z0-9]{3,4}$/.test(id)) break;
      const size = short ? ((bytes[offset + 3] << 16) | (bytes[offset + 4] << 8) | bytes[offset + 5]) : version === 4 ? syncSafe(bytes, offset + 4) : view.getUint32(offset + 4);
      if (!size || size > end - offset - header) break;
      const flags = !short ? bytes[offset + 9] : 0;
      if (fields[id] && !flags) result[fields[id]] = decodeText(bytes.subarray(offset + header, offset + header + Math.min(size, 8192)));
      offset += header + size;
    }
    return result;
  }
  async function readMetadata(file) {
    const pathParts = (file.webkitRelativePath || '').split('/').filter(Boolean);
    const fallback = { name: file.name.replace(/\.[^.]+$/, ''), artistName: '', albumName: pathParts.length > 1 ? pathParts[pathParts.length - 2] : '' };
    try {
      const tags = parseID3(await file.slice(0, Math.min(file.size, 262144)).arrayBuffer());
      if (!tags.name && /\.mp3$/i.test(file.name) && file.size >= 128) {
        const tail = new Uint8Array(await file.slice(-128).arrayBuffer());
        if (String.fromCharCode.apply(null, tail.subarray(0, 3)) === 'TAG') {
          const decoder = new TextDecoder('windows-1252');
          tags.name = clean(decoder.decode(tail.subarray(3, 33)));
          tags.artistName = clean(decoder.decode(tail.subarray(33, 63)));
          tags.albumName = clean(decoder.decode(tail.subarray(63, 93)));
        }
      }
      for (const key of Object.keys(fallback)) if (tags[key]) fallback[key] = tags[key];
    } catch (_) { /* A corrupt tag must never prevent importing an audio file. */ }
    return fallback;
  }
  function recordId(file) { return 'local:' + (file.webkitRelativePath || file.name) + ':' + file.size + ':' + (file.lastModified || 0); }
  function groupLibrary(records, labels) {
    const collator = new Intl.Collator(labels.language || 'en', { numeric: true, sensitivity: 'base' });
    const songs = records.map(record => ({ id: record.id, name: record.name, artistName: record.artistName || labels.unknownArtist, albumName: record.albumName || '', previewUrl: record.url }));
    songs.sort((a, b) => collator.compare(a.name, b.name));
    const artists = new Map(); const albums = new Map();
    for (const song of songs) {
      if (!artists.has(song.artistName)) artists.set(song.artistName, []);
      artists.get(song.artistName).push(song.id);
      if (song.albumName) {
        const name = song.artistName + ' / ' + song.albumName;
        if (!albums.has(name)) albums.set(name, []);
        albums.get(name).push(song.id);
      }
    }
    return { songs, artists: [...artists].map(([name, songIds]) => ({ id: 'artist:' + name, name, songIds })).sort((a, b) => collator.compare(a.name, b.name)), playlists: songs.length ? [{ id: 'all-local', name: labels.allSongs, songIds: songs.map(song => song.id) }, ...[...albums].map(([name, songIds]) => ({ id: 'album:' + name, name, songIds }))] : [] };
  }
  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!scope.indexedDB) { reject(new Error('Storage unavailable')); return; }
      const request = scope.indexedDB.open('apple-ipod-local-v1', 1);
      const timer = setTimeout(() => reject(new Error('Storage blocked')), 5000);
      request.onupgradeneeded = () => request.result.createObjectStore('tracks', { keyPath: 'id' });
      request.onsuccess = () => { clearTimeout(timer); const db = request.result; db.onversionchange = () => db.close(); resolve(db); };
      request.onerror = () => { clearTimeout(timer); reject(request.error); };
      request.onblocked = () => { clearTimeout(timer); reject(new Error('Storage blocked by another tab')); };
    });
  }
  function databaseAction(db, mode, action) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('tracks', mode); let result;
      const request = action(transaction.objectStore('tracks'));
      if (request) request.onsuccess = () => { result = request.result; };
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error('Storage failed'));
      transaction.onabort = () => reject(transaction.error || new Error('Storage aborted'));
    });
  }
  function createDemo() {
    const sampleRate = 22050; const seconds = 24; const count = sampleRate * seconds;
    const buffer = new ArrayBuffer(44 + count * 2); const view = new DataView(buffer);
    const text = (offset, value) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
    text(0, 'RIFF'); view.setUint32(4, 36 + count * 2, true); text(8, 'WAVE'); text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, count * 2, true);
    const chords = [[130.8128, 164.8138, 195.9977], [110, 130.8128, 164.8138], [87.3071, 110, 130.8128], [97.9989, 123.4708, 146.8324]];
    const notes = [523.251, 659.255, 783.991, 659.255, 587.33, 523.251, 440, 391.995];
    for (let i = 0; i < count; i++) {
      const time = i / sampleRate; const chord = chords[Math.floor(time / 3) % chords.length];
      const envelope = Math.min(1, time / 1.2, (seconds - time) / 2);
      let value = 0;
      for (const frequency of chord) value += (Math.sin(2 * Math.PI * frequency * time) + .22 * Math.sin(4 * Math.PI * frequency * time)) * .045;
      const pulse = time % .375; const note = notes[Math.floor(time / .375) % notes.length];
      value += Math.sin(2 * Math.PI * note * time) * Math.exp(-pulse * 12) * .1;
      view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, value * envelope)) * 32767, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }
  const api = { isAudio, parseID3, readMetadata, recordId, groupLibrary, openDatabase, databaseAction, createDemo };
  scope.LocalMusic = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
