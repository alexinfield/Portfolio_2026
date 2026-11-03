/* SPDX-License-Identifier: MIT. Single byte ranges for offline Safari media. */
(function(scope){
  'use strict';
  function parseRange(header,size){
    const match=/^bytes=(\d*)-(\d*)$/i.exec(header||'');
    if(!match||(!match[1]&&!match[2])||!Number.isSafeInteger(size)||size<1)return null;
    let start,end;
    if(!match[1]){const suffix=Number(match[2]);if(!Number.isSafeInteger(suffix)||suffix<1)return null;start=Math.max(0,size-suffix);end=size-1;}
    else{start=Number(match[1]);end=match[2]?Number(match[2]):size-1;}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||end<start)return null;
    return {start,end:Math.min(end,size-1)};
  }
  const api={parseRange};scope.PlayerRange=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
