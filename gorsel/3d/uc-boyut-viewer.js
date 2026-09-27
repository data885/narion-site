(function(){
  var K = [
    ["firca", "#c2c8cc", "Fırçalı paslanmaz", 1.0, 1.0, 1.0, 0],
    ["sampanya", "#d8bb8a", "PVD şampanya", 1.15, 1.02, 0.78, 18],
    ["siyah", "#33373a", "Mat siyah PVD", 0.45, 0.45, 0.48, 0],
    ["gun", "#5c666d", "Gun metal", 0.72, 0.76, 0.82, -8]
  ];

  var MODELLER = [
    {"id": "narion-koza", "ad": "NARION KOZA", "dosya": "model-narion-koza.webp", "yuk": "420 mm", "sise": "1,2 L", "taban": "Ø130 mm"},
    {"id": "narion-ladin", "ad": "NARION LADİN", "dosya": "model-narion-ladin.webp", "yuk": "580 mm", "sise": "1,0 L", "taban": "Ø120 mm"},
    {"id": "narion-manolya", "ad": "NARION MANOLYA", "dosya": "model-narion-manolya.webp", "yuk": "620 mm", "sise": "1,4 L", "taban": "Ø180 mm"},
    {"id": "narion-servi", "ad": "NARION SERVİ", "dosya": "model-narion-servi.webp", "yuk": "640 mm", "sise": "1,3 L", "taban": "Ø140 mm"},
    {"id": "narion-prizma", "ad": "NARION PRİZMA", "dosya": "model-narion-prizma.webp", "yuk": "500 mm", "sise": "1,1 L", "taban": "Ø150 mm"},
    {"id": "narion-nomad", "ad": "NARION NOMAD", "dosya": "model-narion-nomad.webp", "yuk": "360 mm", "sise": "0,9 L", "taban": "Ø160 mm"},
    {"id": "narion-aura", "ad": "NARION AURA", "dosya": "model-narion-aura.webp", "yuk": "540 mm", "sise": "1,2 L", "taban": "Ø160 mm"},
    {"id": "narion-monolit", "ad": "NARION MONOLİT", "dosya": "model-narion-monolit.webp", "yuk": "520 mm", "sise": "1,1 L", "taban": "Ø140 mm"},
    {"id": "narion-inci", "ad": "NARION İNCİ", "dosya": "model-narion-inci.webp", "yuk": "480 mm", "sise": "1,0 L", "taban": "Ø150 mm"},
    {"id": "narion-cakil", "ad": "NARION ÇAKIL", "dosya": "model-narion-cakil.webp", "yuk": "380 mm", "sise": "1,4 L", "taban": "Ø190 mm"}
  ];

  var kap = K[0], mid = MODELLER[0].id;
  var el = document.getElementById('sahne');
  if (!el) return;

  el.innerHTML = '';
  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.cursor = 'grab';
  el.style.userSelect = 'none';

  var canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.objectFit = 'contain';
  el.appendChild(canvas);

  var ctx = canvas.getContext('2d');

  var resimler = {};
  var yuklenen = 0;
  MODELLER.forEach(function(m){
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function(){
      yuklenen++;
      ciz();
    };
    img.src = '../gorsel/' + m.dosya;
    resimler[m.id] = img;
  });

  var rotX = 0, rotY = 0;
  var hedefRotX = 0, hedefRotY = 0;
  var zoom = 1.0, hedefZoom = 1.0;
  var basili = false, sx = 0, sy = 0, pinch0 = 0;
  var autoSweep = 0;

  function resize(){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = el.clientWidth * dpr;
    canvas.height = el.clientHeight * dpr;
    ciz();
  }
  window.addEventListener('resize', resize);

  function ciz(){
    if (!ctx || canvas.width === 0) return;
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 1. Zengin Sıcak Stüdyo Arka Planı
    var bgGrad = ctx.createRadialGradient(W * 0.46, H * 0.32, 10, W * 0.5, H * 0.45, Math.max(W, H) * 0.75);
    bgGrad.addColorStop(0.00, '#38281d');
    bgGrad.addColorStop(0.35, '#241a13');
    bgGrad.addColorStop(0.70, '#130d09');
    bgGrad.addColorStop(1.00, '#0a0705');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Sıcak Işık Huzmesi (Studio Light Beam)
    ctx.save();
    ctx.translate(W * 0.5, H * 0.5);
    var beamGrad = ctx.createLinearGradient(-W * 0.4, -H * 0.5, W * 0.3, H * 0.4);
    beamGrad.addColorStop(0.0, 'rgba(255, 235, 215, 0.12)');
    beamGrad.addColorStop(0.4, 'rgba(215, 175, 135, 0.05)');
    beamGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(-W, -H, W * 2, H * 2);
    ctx.restore();

    // 3. Masa Yüzeyi & Yumuşak Temas Gölgesi
    var mY = H * 0.82;
    var masaGrad = ctx.createRadialGradient(W * 0.5, mY, W * 0.05, W * 0.5, mY, W * 0.48);
    masaGrad.addColorStop(0.00, 'rgba(38, 25, 16, 0.95)');
    masaGrad.addColorStop(0.45, 'rgba(28, 18, 12, 0.70)');
    masaGrad.addColorStop(0.85, 'rgba(15, 10, 6, 0.20)');
    masaGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = masaGrad;
    ctx.beginPath();
    ctx.ellipse(W * 0.5, mY, W * 0.42, H * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gölge Karartması
    var shadowX = W * 0.5 + rotY * 18;
    var golgeGrad = ctx.createRadialGradient(shadowX, mY - H * 0.015, 5, shadowX, mY - H * 0.015, W * 0.18);
    golgeGrad.addColorStop(0.00, 'rgba(6, 4, 3, 0.88)');
    golgeGrad.addColorStop(0.40, 'rgba(8, 5, 4, 0.45)');
    golgeGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = golgeGrad;
    ctx.beginPath();
    ctx.ellipse(shadowX, mY - H * 0.015, W * 0.16, H * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Model Fotoğrafik Render Çizimi
    var curImg = resimler[mid];
    if (curImg && curImg.complete && curImg.naturalWidth > 0) {
      ctx.save();
      var cX = W * 0.5 + rotY * 24;
      var cY = H * 0.48 + rotX * 16;
      ctx.translate(cX, cY);

      // 3D Perspektif & Zoom Dönüşümü
      var scale = (Math.min(W / curImg.naturalWidth, H / curImg.naturalHeight) * 0.86) * zoom;
      ctx.scale(scale, scale);

      // Hafif 3D Yörünge Parallaksı
      ctx.transform(1, 0, Math.tan(rotY * 0.08), 1, 0, 0);

      var iW = curImg.naturalWidth;
      var iH = curImg.naturalHeight;

      // Ana fotoğrafı çiz
      ctx.drawImage(curImg, -iW * 0.5, -iH * 0.5, iW, iH);

      // Kaplama / Finish Filtresi Uygula
      if (kap[0] === 'sampanya') {
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = 'rgba(216, 187, 138, 0.42)';
        ctx.fillRect(-iW * 0.5, -iH * 0.5, iW, iH);

        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillStyle = 'rgba(235, 200, 140, 0.35)';
        ctx.fillRect(-iW * 0.5, -iH * 0.5, iW, iH);
      } else if (kap[0] === 'siyah') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(60, 64, 68, 0.65)';
        ctx.fillRect(-iW * 0.5, -iH * 0.5, iW, iH);

        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(30, 32, 35, 0.30)';
        ctx.fillRect(-iW * 0.5, -iH * 0.5, iW, iH);
      } else if (kap[0] === 'gun') {
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = 'rgba(92, 102, 109, 0.38)';
        ctx.fillRect(-iW * 0.5, -iH * 0.5, iW, iH);

        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(180, 190, 198, 0.45)';
        ctx.fillRect(-iW * 0.5, -iH * 0.5, iW, iH);
      }

      // Dinamik Metalik Işık Parlaması (Specular Light Sweep)
      var lightOffset = (rotY * 1.5 + autoSweep) % 2.0;
      var sheenGrad = ctx.createLinearGradient(-iW * 0.6 + lightOffset * iW * 0.8, -iH * 0.5, -iW * 0.2 + lightOffset * iW * 0.8, iH * 0.5);
      sheenGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
      sheenGrad.addColorStop(0.5, 'rgba(255, 245, 230, 0.14)');
      sheenGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(-iW * 0.5, -iH * 0.5, iW, iH);

      ctx.restore();
    }

    // 5. Fotoğrafik Vinyet
    var vinGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.36, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
    vinGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    vinGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.28)');
    vinGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.65)');
    ctx.fillStyle = vinGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // --- Etkileşim & Kontroller ---
  function onDown(e){
    basili = true;
    el.style.cursor = 'grabbing';
    if (e.touches && e.touches.length === 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      pinch0 = Math.sqrt(dx * dx + dy * dy);
      return;
    }
    var t = e.touches ? e.touches[0] : e;
    sx = t.clientX; sy = t.clientY;
  }

  function onUp(){
    basili = false;
    pinch0 = 0;
    el.style.cursor = 'grab';
  }

  function onMove(e){
    if (!basili) return;
    if (e.touches && e.touches.length === 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      var p = Math.sqrt(dx * dx + dy * dy);
      if (pinch0 > 0) {
        var diff = (p - pinch0) * 0.005;
        hedefZoom = Math.max(0.75, Math.min(2.4, hedefZoom + diff));
      }
      pinch0 = p;
      e.preventDefault();
      return;
    }
    var t = e.touches ? e.touches[0] : e;
    var dX = (t.clientX - sx) * 0.005;
    var dY = (t.clientY - sy) * 0.004;
    hedefRotY = Math.max(-1.0, Math.min(1.0, hedefRotY + dX));
    hedefRotX = Math.max(-0.6, Math.min(0.6, hedefRotX + dY));
    sx = t.clientX; sy = t.clientY;
    if (e.touches) e.preventDefault();
  }

  el.addEventListener('mousedown', onDown);
  el.addEventListener('touchstart', onDown, {passive:false});
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);
  window.addEventListener('mousemove', onMove);
  el.addEventListener('touchmove', onMove, {passive:false});

  el.addEventListener('wheel', function(e){
    if (!e.ctrlKey && !e.metaKey) return;
    hedefZoom = Math.max(0.75, Math.min(2.4, hedefZoom - e.deltaY * 0.002));
    e.preventDefault();
  }, {passive:false});

  var zi = document.getElementById('z-in'), zo = document.getElementById('z-out');
  if (zi) zi.addEventListener('click', function(){ hedefZoom = Math.min(2.4, hedefZoom + 0.25); });
  if (zo) zo.addEventListener('click', function(){ hedefZoom = Math.max(0.75, hedefZoom - 0.25); });

  // Animasyon Döngüsü
  function anim(){
    requestAnimationFrame(anim);
    var dY = hedefRotY - rotY;
    var dX = hedefRotX - rotX;
    var dZ = hedefZoom - zoom;

    if (!basili) {
      hedefRotY *= 0.95;
      hedefRotX *= 0.95;
    }

    if (Math.abs(dY) > 0.0005 || Math.abs(dX) > 0.0005 || Math.abs(dZ) > 0.001) {
      rotY += dY * 0.16;
      rotX += dX * 0.16;
      zoom += dZ * 0.16;
      ciz();
    }
  }

  // Model Butonları
  document.querySelectorAll('[data-model]').forEach(function(b){
    b.addEventListener('click', function(){
      mid = b.dataset.model;
      document.querySelectorAll('[data-model]').forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
      hedefRotY = 0.35;
      ciz();
    });
  });

  // Kaplama Butonları
  document.querySelectorAll('[data-kaplama]').forEach(function(b){
    b.addEventListener('click', function(){
      kap = K.filter(function(x){ return x[0] === b.dataset.kaplama; })[0] || K[0];
      document.querySelectorAll('[data-kaplama]').forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
      ciz();
    });
  });

  // Görüntü İndir Butonu
  var dlb = document.getElementById('v3-indir');
  if (dlb) dlb.addEventListener('click', function(){
    var a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'narion-' + mid.replace('narion-', '') + '-' + kap[0] + '.png';
    a.click();
  });

  resize();
  anim();
})();
