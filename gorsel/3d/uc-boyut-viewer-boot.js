(function(){
  var url = '../gorsel/3d/uc-boyut-viewer.js';
  function run(code){ (0,eval)(code); }
  // Prefer real .js (when binary/text push available); else .b64 sidecar
  fetch(url).then(function(r){
    if(!r.ok) throw new Error('no js');
    return r.text();
  }).then(run).catch(function(){
    return fetch(url + '.b64').then(function(r){
      if(!r.ok) throw new Error('no b64');
      return r.text();
    }).then(function(b64){
      var bin = atob(b64.trim());
      // UTF-8 decode
      var bytes = new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
      run(new TextDecoder('utf-8').decode(bytes));
    }).catch(function(e){
      console.error('NARION 3D viewer failed to load', e);
    });
  });
})();
