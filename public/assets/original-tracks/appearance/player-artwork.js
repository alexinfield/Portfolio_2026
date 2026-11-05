/* SPDX-License-Identifier: MIT. New vector drawings; no upstream SVG data. */
(function () {
  'use strict';
  const svg=(width,height,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">${body}</svg>`;
  // Individually positioned letters follow a shallow circular baseline.
  const letters=[['m',46,25,-9],['e',61,23.5,-3],['n',72,23.5,3],['u',84,25,9]];
  window.PlayerArtwork=Object.freeze({
    menu:svg(136,40,letters.map(([letter,x,y,angle])=>`<text x="${x}" y="${y}" transform="rotate(${angle} ${x} ${y})" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="18.7" font-weight="700" fill="currentColor">${letter}</text>`).join('')),
    skip:svg(24,14,'<path fill="currentColor" d="M2 1h3v12H2zM5 7l8-6v12zM13 7l9-6v12z"/>'),
    toggle:svg(26,14,'<path fill="currentColor" d="M2 0v14l10-7zM16 0h3v14h-3zM22 0h3v14h-3z"/>'),
    indicatorPlay:svg(16,20,'<path fill="currentColor" d="M2 2v16l12-8z"/>'),
    indicatorPause:svg(16,20,'<path fill="currentColor" d="M2 2h4v16H2zM10 2h4v16h-4z"/>'),
    battery:svg(110,56,'<g fill="none" stroke="currentColor" stroke-width="6"><path d="M3 3h98v50H3z"/><path d="M104 19h3v18h-3"/></g><g fill="currentColor"><path d="M11 11h15v34H11zM33 11h15v34H33zM55 11h15v34H55zM77 11h15v34H77z"/></g>')
  });
})();
