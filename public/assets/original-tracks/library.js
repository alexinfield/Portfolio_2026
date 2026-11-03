/* SPDX-License-Identifier: MIT. Hosted recording groups; upstream notice: LICENSE. */
(function(scope){
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
  scope.LocalMusic={groupLibrary};
})(typeof window==='undefined'?globalThis:window);
