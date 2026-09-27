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
      malzeme: 'AISI 304 Paslanmaz Çelik'
    },
    'narion-ladin': {
      name: 'LADİN',
      code: 'NARION LADİN · LOUNGE SERİ',
      height: '580 mm',
      sise: '1,0 L · Kristal Cam',
      taban: 'Ø120 mm (Kompakt)',
      malzeme: 'AISI 304 Paslanmaz Çelik'
    },
    'narion-manolya': {
      name: 'MANOLYA',
      code: 'NARION MANOLYA · PRESTİJ SERİ',
      height: '620 mm',
      sise: '1,4 L · Kristal Fasetalı',
      taban: 'Ø180 mm (Geniş Taban)',
      malzeme: 'AISI 304 / 316L Çelik'
    },
    'narion-servi': {
      name: 'SERVİ',
      code: 'NARION SERVİ · İNCE MİMARİ SERİ',
      height: '640 mm',
      sise: '1,3 L · Dikey Silindir',
      taban: 'Ø140 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik'
    },
    'narion-prizma': {
      name: 'PRİZMA',
      code: 'NARION PRİZMA · GEOMETRİK SERİ',
      height: '500 mm',
      sise: '1,1 L · Altıgen Prizma',
      taban: 'Ø150 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik'
    },
    'narion-nomad': {
      name: 'NOMAD',
      code: 'NARION NOMAD · SEYAHAT SERİ',
      height: '360 mm',
      sise: '0,9 L · Darbeye Dayanıklı',
      taban: 'Ø160 mm (Ultra Alçak Merkez)',
      malzeme: 'Hafifletilmiş AISI 304'
    },
    'narion-aura': {
      name: 'AURA',
      code: 'NARION AURA · DAMLA PRESTİJ',
      height: '540 mm',
      sise: '1,2 L · Damla Formu',
      taban: 'Ø160 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik'
    },
    'narion-monolit': {
      name: 'MONOLİT',
      code: 'NARION MONOLİT · MASİF BLOK',
      height: '520 mm',
      sise: '1,1 L · Ağır Taban Hazne',
      taban: 'Ø140 mm',
      malzeme: 'AISI 304 / 316L Çelik'
    },
    'narion-inci': {
      name: 'İNCİ',
      code: 'NARION İNCİ · SERAMİK & ÇELİK',
      height: '480 mm',
      sise: '1,0 L · Oval Beyaz Kristal',
      taban: 'Ø150 mm',
      malzeme: 'AISI 304 & Teknik Seramik'
    },
    'narion-cakil': {
      name: 'ÇAKIL',
      code: 'NARION ÇAKIL · GENİŞ TABAN',
      height: '380 mm',
      sise: '1,4 L · Doğal Çakıl Formu',
      taban: 'Ø190 mm (Maksimum Denge)',
      malzeme: 'AISI 304 Paslanmaz Çelik'
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
  // Real-Time Visual Update with Smooth Crossfade
  // -------------------------------------------------------------
  function updateProductVisual() {
    var newSrc = resolveImageSrc(currentModelId, currentFinishId);
    var incoming = activeSlot === 'a' ? imgB : imgA;
    var outgoing = activeSlot === 'a' ? imgA : imgB;

    // Preload & crossfade
    var loader = new Image();
    loader.onload = function () {
      incoming.src = newSrc;
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
      activeSlot = activeSlot === 'a' ? 'b' : 'a';
    };
    loader.src = newSrc;

    updateSummarySheet();
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
    if (elAhs) elAhs.textContent = wood.name;

    var elYuk = document.getElementById('sum-yuk');
    if (elYuk) elYuk.textContent = model.height;

    var elSise = document.getElementById('sum-sise');
    if (elSise) elSise.textContent = model.sise;

    var elTab = document.getElementById('sum-taban');
    if (elTab) elTab.textContent = model.taban;

    var elMalz = document.getElementById('sum-malzeme');
    if (elMalz) elMalz.textContent = model.malzeme;
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
        updateSummarySheet();
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
        var src = resolveImageSrc(currentModelId, currentFinishId);
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
