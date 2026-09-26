(function(){
  var base = '../gorsel/3d/uc-boyut-viewer.js';
  var N = 8;
  function run(code){ (0,eval)(code); }
  function fromB64(b64){
    var bin = atob(b64.trim());
    var bytes = new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    run(new TextDecoder('utf-8').decode(bytes));
  }
  function loadParts(){
    var reqs = [];
    for(var i=0;i<N;i++){
      (function(i){
        reqs.push(fetch(base+'.b64.p'+String(i).padStart(2,'0')).then(function(r){
          if(!r.ok) throw new Error('part '+i); return r.text();
        }));
      })(i);
    }
    return Promise.all(reqs).then(function(ps){ fromB64(ps.join('')); });
  }
  fetch(base).then(function(r){ if(!r.ok) throw new Error('no js'); return r.text(); })
    .then(run)
    .catch(function(){
      return fetch(base+'.b64').then(function(r){ if(!r.ok) throw new Error('no b64'); return r.text(); })
        .then(fromB64)
        .catch(loadParts);
    })
    .catch(function(e){ console.error('NARION 3D viewer failed to load', e); });
})();
