/**
 * NARION — Photorealistic Studio Configurator (HBOT Architecture)
 * 
 * Features:
 * - 40 authentic master photographic studio renders (10 models x 4 metal finishes).
 * - Real-time cross-fading when choosing any model OR finish (0ms input lag, 60 FPS).
 * - 3D parallax depth & spotlight follow on mouse/touch.
 * - Macro close-up & overview view modes.
 * - Live synchronized specification summary sheet.
 * - Direct download of the configured high-resolution product render.
 */

(function () {
  'use strict';

  var MODELLER = {
    'narion-koza': {
      name: 'KOZA',
      code: 'NARION KOZA · MODERN SERİ',
      height: '420 mm',
      sise: '1,2 L · Tritan',
      taban: 'Ø130 mm (Devrilmez)',
      malzeme: 'AISI 304 Paslanmaz Çelik & Masif Ceviz',
      hasWood: true
    },
    'narion-ladin': {
      name: 'LADİN',
      code: 'NARION LADİN · LOUNGE SERİ',
      height: '580 mm',
      sise: '1,0 L · Kristal Cam',
      taban: 'Ø120 mm (Kompakt)',
      malzeme: 'AISI 304 Paslanmaz Çelik & Balıksırtı Ahşap',
      hasWood: true
    },
    'narion-manolya': {
      name: 'MANOLYA',
      code: 'NARION MANOLYA · PRESTİJ SERİ',
      height: '620 mm',
      sise: '1,4 L · Kristal Fasetalı',
      taban: 'Ø180 mm (Geniş Taban)',
      malzeme: 'AISI 304 / 316L Çelik & Ahşap Bilezik',
      hasWood: true
    },
    'narion-servi': {
      name: 'SERVİ',
      code: 'NARION SERVİ · İNCE MİMARİ SERİ',
      height: '640 mm',
      sise: '1,3 L · Dikey Silindir',
      taban: 'Ø140 mm',
      malzeme: 'Tornalanmış Masif Ahşap Gövde & Çelik',
      hasWood: true
    },
    'narion-prizma': {
      name: 'PRİZMA',
      code: 'NARION PRİZMA · GEOMETRİK SERİ',
      height: '500 mm',
      sise: '1,1 L · Altıgen Prizma',
      taban: 'Ø150 mm',
      malzeme: 'AISI 304 / Eloksallı Titanyum',
      hasWood: false,
      woodNote: 'PRİZMA monolitik geometrik metal gövdedir (Ahşap panel içermez).'
    },
    'narion-nomad': {
      name: 'NOMAD',
      code: 'NARION NOMAD · SEYAHAT SERİ',
      height: '360 mm',
      sise: '0,9 L · Darbeye Dayanıklı',
      taban: 'Ø160 mm (Ultra Alçak Merkez)',
      malzeme: 'Hafifletilmiş Metal & Koruma Kılıfı',
      hasWood: false,
      woodNote: 'NOMAD seyahat serisi yekpare hafifletilmiş metal alaşımdır (Ahşap panel içermez).'
    },
    'narion-aura': {
      name: 'AURA',
      code: 'NARION AURA · DAMLA PRESTİJ',
      height: '540 mm',
      sise: '1,2 L · Damla Formu',
      taban: 'Ø160 mm',
      malzeme: 'PVD Pirinç Kanatlar & Ceviz İç Kaplama',
      hasWood: true
    },
    'narion-monolit': {
      name: 'MONOLİT',
      code: 'NARION MONOLİT · MASİF BLOK',
      height: '520 mm',
      sise: '1,1 L · Ağır Taban Hazne',
      taban: 'Ø140 mm',
      malzeme: 'Masif Ahşap Kolon & Pirinç / Mermer Taban',
      hasWood: true
    },
    'narion-inci': {
      name: 'İNCİ',
      code: 'NARION İNCİ · SERAMİK & ÇELİK',
      height: '480 mm',
      sise: '1,0 L · Oval Beyaz Kristal',
      taban: 'Ø150 mm',
      malzeme: 'Fırınlanmış Teknik Seramik & Pirinç',
      hasWood: false,
      woodNote: 'İNCİ modeli fırınlanmış teknik seramik gövdelidir (Ahşap panel içermez).'
    },
    'narion-cakil': {
      name: 'ÇAKIL',
      code: 'NARION ÇAKIL · GENİŞ TABAN',
      height: '380 mm',
      sise: '1,4 L · Doğal Çakıl Formu',
      taban: 'Ø190 mm (Maksimum Denge)',
      malzeme: 'Yekpare Döküm Mineral / Gun Metal Gövde',
      hasWood: false,
      woodNote: 'ÇAKIL akarsu taşından esinlenen tek kütle mineral/metal gövdedir (Ahşap panel içermez).'
    }
  };

  var FINISHES = {
    'firca': { name: 'Fırçalı Paslanmaz', spec: 'AISI 304 / 316L Satin' },
    'sampanya': { name: 'PVD Şampanya', spec: 'Lüks Pirinç & Altın PVD' },
    'siyah': { name: 'Mat Siyah PVD', spec: 'Obsidyen Titanyum Kaplama' },
    'gun': { name: 'Gun Metal', spec: 'Koyu Grafit Metalik' }
  };

  var WOODS = {
    'ceviz': { name: 'Doğal Amerikan Ceviz', spec: 'Derin Damarlı Ahşap' },
    'mese': { name: 'Füme Koyu Meşe', spec: 'Mat İsli Meşe Dokusu' },
    'disbudak': { name: 'Siyah Dişbudak', spec: 'Siyah Ahşap Greni' }
  };

  var stage = document.getElementById('sahne');
  if (!stage) return;

  // Build HBOT Studio Stage Elements
  stage.innerHTML = '';

  var spotlight = document.createElement('div');
  spotlight.className = 'stage-spotlight';
  stage.appendChild(spotlight);

  var tiltWrap = document.createElement('div');
  tiltWrap.className = 'stage-tilt';
  tiltWrap.id = 'stage-tilt';

  var imgA = document.createElement('img');
  imgA.className = 'stage-img is-active';
  imgA.id = 'stage-img-a';
  imgA.alt = 'NARION Ürün Render';
  tiltWrap.appendChild(imgA);

  var imgB = document.createElement('img');
  imgB.className = 'stage-img';
  imgB.id = 'stage-img-b';
  imgB.alt = 'NARION Ürün Render';
  tiltWrap.appendChild(imgB);

  stage.appendChild(tiltWrap);

  var floor = document.createElement('div');
  floor.className = 'stage-floor';
  stage.appendChild(floor);

  var badge = document.createElement('span');
  badge.className = 'stage-badge';
  badge.id = 'stage-badge';
  badge.textContent = 'NARION KOZA · FIRÇALI PASLANMAZ';
  stage.appendChild(badge);

  var viewToggle = document.createElement('div');
  viewToggle.className = 'stage-view-toggle';
  viewToggle.innerHTML = '<button type="button" class="stage-v-btn is-active" data-view="tam">Genel Görünüm</button>' +
                          '<button type="button" class="stage-v-btn" data-view="yakin">Makro Detay</button>';
  stage.appendChild(viewToggle);

  var zoomControls = document.createElement('div');
  zoomControls.className = 'stage-zoom-controls';
  zoomControls.innerHTML = '<button type="button" class="stage-z-btn" id="z-in" title="Yakınlaştır">+</button>' +
                           '<button type="button" class="stage-z-btn" id="z-out" title="Uzaklaştır">&minus;</button>';
  stage.appendChild(zoomControls);

  // State
  var currentModelId = 'narion-koza';
  var currentFinishId = 'firca';
  var currentWoodId = 'ceviz';
  var activeSlot = 'a';
  var currentScale = 1.0;
  var targetScale = 1.0;
  var currentTiltX = 0, currentTiltY = 0;
  var targetTiltX = 0, targetTiltY = 0;

  // Wood Recolor Engine & Cache (HBOT Architecture)
  var renderCache = {};
  var offCanvas = document.createElement('canvas');
  var offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

  function rgbToHsl(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    var d = max - min;
    var s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    var h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    if (s === 0) return [l, l, l];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    function f(t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    return [f(h + 1/3), f(h), f(h - 1/3)];
  }

  function isWoodPixel(mId, r, g, b, h, s, l, nx, ny) {
    if (mId === 'narion-koza') {
      var inBody = (nx > 0.31) && (nx < 0.59) && (ny > 0.19) && (ny < 0.78);
      var isWin = (nx > 0.36) && (nx < 0.54) && (ny > 0.37) && (ny < 0.55);
      return inBody && !isWin && (s > 0.16) && (h > 0.03) && (h < 0.14) && (l < 0.70);
    }
    if (mId === 'narion-ladin') {
      var inCol = (nx > 0.35) && (nx < 0.65) && (ny > 0.21) && (ny < 0.72);
      return inCol && (s > 0.16) && (h > 0.03) && (h < 0.14) && (l < 0.75);
    }
    if (mId === 'narion-manolya') {
      var inCol = (nx > 0.39) && (nx < 0.61) && (ny > 0.16) && (ny < 0.39);
      return inCol && (s > 0.14) && (h > 0.03) && (h < 0.14) && (l < 0.75);
    }
    if (mId === 'narion-servi') {
      var inCol = (nx > 0.43) && (nx < 0.57) && (ny > 0.14) && (ny < 0.60);
      return inCol && (s > 0.13) && (h > 0.03) && (h < 0.14) && (l < 0.75);
    }
    if (mId === 'narion-aura') {
      var inCol = (nx > 0.35) && (nx < 0.65) && (ny > 0.36) && (ny < 0.72);
      return inCol && (s > 0.18) && (h > 0.03) && (h < 0.13) && (l < 0.65);
    }
    if (mId === 'narion-monolit') {
      var inCol = (nx > 0.35) && (nx < 0.65) && (ny > 0.28) && (ny < 0.69);
      return inCol && (s > 0.16) && (h > 0.03) && (h < 0.13) && (l < 0.65);
    }
    if (mId === 'narion-nomad') {
      var inCol = (nx > 0.30) && (nx < 0.70) && (ny > 0.22) && (ny < 0.62);
      return inCol && (l > 0.10) && (l < 0.55) && (s < 0.20);
    }
    if (mId === 'narion-cakil') {
      var inCol = (nx > 0.44) && (nx < 0.64) && (ny > 0.32) && (ny < 0.61);
      return inCol && (l > 0.18) && (l < 0.65);
    }
    if (mId === 'narion-inci') {
      var inCol = (nx > 0.44) && (nx < 0.64) && (ny > 0.23) && (ny < 0.46);
      return inCol && (l > 0.18) && (l < 0.65);
    }
    if (mId === 'narion-prizma') {
      var inCol = (nx > 0.40) && (nx < 0.60) && (ny > 0.22) && (ny < 0.55);
      return inCol && (l > 0.15) && (l < 0.60);
    }
    return false;
  }

  function applyWoodRecolor(imgElement, mId, wId) {
    if (wId === 'ceviz') return imgElement.src;
    var w = imgElement.naturalWidth || imgElement.width || 760;
    var h = imgElement.naturalHeight || imgElement.height || 1132;
    offCanvas.width = w;
    offCanvas.height = h;
    offCtx.drawImage(imgElement, 0, 0, w, h);
    var imgData = offCtx.getImageData(0, 0, w, h);
    var d = imgData.data;

    for (var i = 0; i < d.length; i += 4) {
      var pxIdx = i / 4;
      var x = pxIdx % w;
      var y = Math.floor(pxIdx / w);
      var nx = x / w;
      var ny = y / h;

      var r = d[i] / 255;
      var g = d[i + 1] / 255;
      var b = d[i + 2] / 255;

      var hsl = rgbToHsl(r, g, b);
      var p_h = hsl[0], p_s = hsl[1], p_l = hsl[2];

      if (isWoodPixel(mId, r, g, b, p_h, p_s, p_l, nx, ny)) {
        var hi = Math.max(0, Math.min(1, (p_l - 0.40) / 0.40));
        var outRgb = null;
        if (wId === 'mese') {
          var m_h = Math.max(0.05, Math.min(0.09, p_h * 0.95));
          var m_s = p_s * 0.35;
          var m_l = Math.max(0, Math.min(1, p_l * 0.58 + 0.08 * hi));
          outRgb = hslToRgb(m_h, m_s, m_l);
        } else if (wId === 'disbudak') {
          var d_s = p_s * 0.08;
          var d_l = Math.max(0, Math.min(1, p_l * 0.30 + 0.18 * hi));
          outRgb = hslToRgb(p_h, d_s, d_l);
        }
        if (outRgb) {
          d[i] = Math.round(outRgb[0] * 255);
          d[i + 1] = Math.round(outRgb[1] * 255);
          d[i + 2] = Math.round(outRgb[2] * 255);
        }
      }
    }
    offCtx.putImageData(imgData, 0, 0);
    return offCanvas.toDataURL('image/webp');
  }

  function resolveImageSrc(modelId, finishId) {
    return '../gorsel/renkler/' + modelId + '-' + finishId + '.webp';
  }

  // Load initial image
  var initialSrc = resolveImageSrc(currentModelId, currentFinishId);
  imgA.src = initialSrc;
  imgB.src = initialSrc;

  // -------------------------------------------------------------
  // Parallax Tilt & Dynamic Spotlight
  // -------------------------------------------------------------
  function updateTilt() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.12;
    currentTiltY += (targetTiltY - currentTiltY) * 0.12;
    currentScale += (targetScale - currentScale) * 0.12;

    tiltWrap.style.transform = 'rotateX(' + currentTiltX.toFixed(2) + 'deg) rotateY(' + currentTiltY.toFixed(2) + 'deg) scale(' + currentScale.toFixed(3) + ')';

    var spotX = 50 + currentTiltY * 1.6;
    var spotY = 28 - currentTiltX * 1.6;
    spotlight.style.background = 'radial-gradient(ellipse 75% 55% at ' + spotX.toFixed(1) + '% ' + spotY.toFixed(1) + '%, rgba(216, 187, 138, 0.22), rgba(255, 255, 255, 0.06) 45%, transparent 72%)';

    requestAnimationFrame(updateTilt);
  }
  requestAnimationFrame(updateTilt);

  stage.addEventListener('pointerleave', function () {
    targetTiltX = 0;
    targetTiltY = 0;
  });

  stage.addEventListener('pointermove', function (e) {
    var rect = stage.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width;
    var y = (e.clientY - rect.top) / rect.height;

    targetTiltY = (x - 0.5) * 14;
    targetTiltX = (0.5 - y) * 12;
  });

  // -------------------------------------------------------------
  // Real-Time Visual Update with Smooth Crossfade & Wood Engine
  // -------------------------------------------------------------
  function updateProductVisual() {
    var model = MODELLER[currentModelId] || MODELLER['narion-koza'];
    var effectiveWood = model.hasWood ? currentWoodId : 'ceviz';
    var cacheKey = currentModelId + '_' + currentFinishId + '_' + effectiveWood;
    var incoming = activeSlot === 'a' ? imgB : imgA;
    var outgoing = activeSlot === 'a' ? imgA : imgB;

    function applySrc(srcUrl) {
      incoming.src = srcUrl;
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
      activeSlot = activeSlot === 'a' ? 'b' : 'a';
      updateSummarySheet();
    }

    if (renderCache[cacheKey]) {
      applySrc(renderCache[cacheKey]);
      return;
    }

    var baseSrc = resolveImageSrc(currentModelId, currentFinishId);
    var loader = new Image();
    loader.crossOrigin = 'anonymous';
    loader.onload = function () {
      if (!model.hasWood || effectiveWood === 'ceviz') {
        renderCache[cacheKey] = baseSrc;
        applySrc(baseSrc);
      } else {
        var recoloredUrl = applyWoodRecolor(loader, currentModelId, effectiveWood);
        renderCache[cacheKey] = recoloredUrl;
        applySrc(recoloredUrl);
      }
    };
    loader.src = baseSrc;
  }

  // -------------------------------------------------------------
  // View Modes (Tam / Yakın)
  // -------------------------------------------------------------
  function setView(viewMode) {
    if (viewMode === 'yakin') {
      targetScale = 1.75;
      tiltWrap.style.transformOrigin = '50% 36%';
    } else {
      targetScale = 1.0;
      tiltWrap.style.transformOrigin = '50% 50%';
    }
  }

  // -------------------------------------------------------------
  // Specification Summary Sheet
  // -------------------------------------------------------------
  function updateSummarySheet() {
    var model = MODELLER[currentModelId] || MODELLER['narion-koza'];
    var finish = FINISHES[currentFinishId] || FINISHES['firca'];
    var wood = WOODS[currentWoodId] || WOODS['ceviz'];

    var elBadge = document.getElementById('stage-badge');
    if (elBadge) {
      elBadge.textContent = 'NARION ' + model.name + ' · ' + finish.name.toUpperCase();
    }

    var elCode = document.getElementById('sum-code');
    if (elCode) elCode.textContent = model.code;

    var elTitle = document.getElementById('sum-title');
    if (elTitle) elTitle.textContent = model.name;

    var elKap = document.getElementById('sum-kaplama');
    if (elKap) elKap.textContent = finish.name;

    var elAhs = document.getElementById('sum-ahsap');
    if (elAhs) {
      elAhs.textContent = model.hasWood ? wood.name : (model.woodNote || 'Gövde Yekpare (Ahşap Yok)');
    }

    var elYuk = document.getElementById('sum-yuk');
    if (elYuk) elYuk.textContent = model.height;

    var elSise = document.getElementById('sum-sise');
    if (elSise) elSise.textContent = model.sise;

    var elTab = document.getElementById('sum-taban');
    if (elTab) elTab.textContent = model.taban;

    var elMalz = document.getElementById('sum-malzeme');
    if (elMalz) elMalz.textContent = model.malzeme;

    // Adapt Step 3 (Wood Section) dynamically according to model capability
    var woodSwatches = document.querySelectorAll('[data-ahsap]');
    var woodParent = woodSwatches.length > 0 ? woodSwatches[0].closest('.config-step-card') : null;
    var woodNote = woodParent ? woodParent.querySelector('.config-step-note') : null;
    var woodGrid = woodParent ? woodParent.querySelector('.config-swatch-grid') : null;

    if (woodParent) {
      if (!model.hasWood) {
        if (woodNote) {
          woodNote.innerHTML = '<span style="display:inline-block; padding:6px 12px; background:#fff4e6; color:#9c4c00; border-radius:6px; font-weight:600; font-size:13px; line-height:1.4;">' +
            'ℹ️ ' + (model.woodNote || 'Bu modelde ahşap panel opsiyonu bulunmaz.') + '</span>';
        }
        if (woodGrid) {
          woodGrid.style.opacity = '0.30';
          woodGrid.style.pointerEvents = 'none';
          woodGrid.style.filter = 'grayscale(1)';
        }
      } else {
        if (woodNote) {
          woodNote.textContent = 'Doğal fırınlanmış sert ağaç panel; suya ve ısıya karşı özel emprenye korumalıdır.';
        }
        if (woodGrid) {
          woodGrid.style.opacity = '1.0';
          woodGrid.style.pointerEvents = 'auto';
          woodGrid.style.filter = 'none';
        }
      }
    }
  }

  // -------------------------------------------------------------
  // UI Bindings
  // -------------------------------------------------------------
  function bindEvents() {
    // 1. Model Selection
    var mCards = document.querySelectorAll('[data-model]');
    mCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var mId = card.getAttribute('data-model');
        if (!mId || mId === currentModelId) return;
        currentModelId = mId;
        mCards.forEach(function (c) { c.classList.remove('is-active'); });
        card.classList.add('is-active');
        updateProductVisual();
      });
    });

    // 2. Finish Selection (Fırçalı Paslanmaz, PVD Şampanya, Mat Siyah, Gun Metal)
    var fSwatches = document.querySelectorAll('[data-kaplama]');
    fSwatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        var fId = sw.getAttribute('data-kaplama');
        if (!fId || fId === currentFinishId) return;
        currentFinishId = fId;
        fSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        updateProductVisual();
      });
    });

    // 3. Wood Selection (Amerikan Ceviz, Füme Meşe, Siyah Dişbudak)
    var wSwatches = document.querySelectorAll('[data-ahsap]');
    wSwatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        var wId = sw.getAttribute('data-ahsap');
        if (!wId || wId === currentWoodId) return;
        currentWoodId = wId;
        wSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        updateProductVisual();
      });
    });

    // 4. View Mode Buttons
    var vBtns = document.querySelectorAll('.stage-v-btn');
    vBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-view');
        if (!mode) return;
        vBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        setView(mode);
      });
    });

    // 5. Zoom In / Out Buttons
    var btnZIn = document.getElementById('z-in');
    if (btnZIn) {
      btnZIn.addEventListener('click', function () {
        targetScale = Math.min(targetScale + 0.35, 2.5);
      });
    }

    var btnZOut = document.getElementById('z-out');
    if (btnZOut) {
      btnZOut.addEventListener('click', function () {
        targetScale = Math.max(targetScale - 0.35, 0.8);
      });
    }

    // 6. Download High-Res Image
    var btnDl = document.getElementById('v3-indir');
    if (btnDl) {
      btnDl.addEventListener('click', function () {
        var activeImg = activeSlot === 'a' ? imgA : imgB;
        var src = activeImg.src || resolveImageSrc(currentModelId, currentFinishId);
        var link = document.createElement('a');
        link.download = currentModelId + '-' + currentFinishId + '-' + currentWoodId + '.webp';
        link.href = src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  bindEvents();
  updateSummarySheet();

})();
