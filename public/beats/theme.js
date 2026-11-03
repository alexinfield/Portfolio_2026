/* Follow the system/browser preference before the first styled paint. */
(function(scope){
  'use strict';
  function attachTheme(root,media,themeMeta){
    function apply(){
      const scheme=media.matches?'dark':'light';
      root.setAttribute('data-theme',scheme);
      root.style.colorScheme=scheme;
      if(themeMeta)themeMeta.setAttribute('content',scheme==='dark'?'#1f1f1f':'#f3f3f3');
    }
    apply();
    if(media.addEventListener)media.addEventListener('change',apply);
    else if(media.addListener)media.addListener(apply);
    return {apply,dispose(){if(media.removeEventListener)media.removeEventListener('change',apply);else if(media.removeListener)media.removeListener(apply);}};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={attachTheme};
  if(scope.document&&scope.matchMedia)attachTheme(scope.document.documentElement,scope.matchMedia('(prefers-color-scheme: dark)'),scope.document.querySelector('meta[name="theme-color"]'));
})(typeof window!=='undefined'?window:globalThis);
