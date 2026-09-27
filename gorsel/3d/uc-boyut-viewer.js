/**
 * NARION — Photorealistic Studio Configurator (HBOT Architecture)
 * 
 * Displays 100% authentic master studio photography renders for all NARION models
 * with 3D parallax depth, spotlight sweep, smooth cross-fading, macro zoom,
 * live specification card synchronization, and high-res export.
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
      malzeme: 'AISI 304 Paslanmaz Çelik',
      image: '../gorsel/model-narion-koza.webp'
    },
    'narion-ladin': {
      name: 'LADİN',
      code: 'NARION LADİN · LOUNGE SERİ',
      height: '580 mm',
      sise: '1,0 L · Kristal Cam',
      taban: 'Ø120 mm (Kompakt)',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      image: '../gorsel/model-narion-ladin.webp'
    },
    'narion-manolya': {
      name: 'MANOLYA',
      code: 'NARION MANOLYA · PRESTİJ SERİ',
      height: '620 mm',
      sise: '1,4 L · Kristal Fasetalı',
      taban: 'Ø180 mm (Geniş Taban)',
      malzeme: 'AISI 304 / 316L Çelik',
      image: '../gorsel/model-narion-manolya.webp'
    },
    'narion-servi': {
      name: 'SERVİ',
      code: 'NARION SERVİ · İNCE MİMARİ SERİ',
      height: '640 mm',
      sise: '1,3 L · Dikey Silindir',
      taban: 'Ø140 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      image: '../gorsel/model-narion-servi.webp'
    },
    'narion-prizma': {
      name: 'PRİZMA',
      code: 'NARION PRİZMA · GEOMETRİK SERİ',
      height: '500 mm',
      sise: '1,1 L · Altıgen Prizma',
      taban: 'Ø150 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      image: '../gorsel/model-narion-prizma.webp'
    },
    'narion-nomad': {
      name: 'NOMAD',
      code: 'NARION NOMAD · SEYAHAT SERİ',
      height: '360 mm',
      sise: '0,9 L · Darbeye Dayanıklı',
      taban: 'Ø160 mm (Ultra Alçak Merkez)',
      malzeme: 'Hafifletilmiş AISI 304',
      image: '../gorsel/model-narion-nomad.webp'
    },
    'narion-aura': {
      name: 'AURA',
      code: 'NARION AURA · DAMLA PRESTİJ',
      height: '540 mm',
      sise: '1,2 L · Damla Formu',
      taban: 'Ø160 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      image: '../gorsel/model-narion-aura.webp'
    },
    'narion-monolit': {
      name: 'MONOLİT',
      code: 'NARION MONOLİT · MASİF BLOK',
      height: '520 mm',
      sise: '1,1 L · Ağır Taban Hazne',
      taban: 'Ø140 mm',
      malzeme: 'AISI 304 / 316L Çelik',
      image: '../gorsel/model-narion-monolit.webp'
    },
    'narion-inci': {
      name: 'İNCİ',
      code: 'NARION İNCİ · SERAMİK & ÇELİK',
      height: '480 mm',
      sise: '1,0 L · Oval Beyaz Kristal',
      taban: 'Ø150 mm',
      malzeme: 'AISI 304 & Teknik Seramik',
      image: '../gorsel/model-narion-inci.webp'
    },
    'narion-cakil': {
      name: 'ÇAKIL',
      code: 'NARION ÇAKIL · GENİŞ TABAN',
      height: '380 mm',
      sise: '1,4 L · Doğal Çakıl Formu',
      taban: 'Ø190 mm (Maksimum Denge)',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      image: '../gorsel/model-narion-cakil.webp'
    }
  };

  var FINISHES = {
    'firca': { name: 'Fırçalı Paslanmaz', spec: 'AISI 304 / 316L Satin', color: '#dedfe3' },
    'sampanya': { name: 'PVD Şampanya', spec: 'Lüks Pirinç & Altın PVD', color: '#d8ba7d' },
    'siyah': { name: 'Mat Siyah PVD', spec: 'Obsidyen Titanyum Kaplama', color: '#222428' },
    'gun': { name: 'Gun Metal', spec: 'Koyu Grafit Metalik', color: '#4e5760' }
  };

  var WOODS = {
    'ceviz': { name: 'Doğal Amerikan Ceviz', spec: 'Derin Damarlı Ahşap' },
    'mese': { name: 'Füme Koyu Meşe', spec: 'Mat İsli Meşe Dokusu' },
    'disbudak': { name: 'Siyah Dişbudak', spec: 'Siyah Ahşap Greni' }
  };

  var stage = document.getElementById('sahne');
  if (!stage) return;

  // Initialize HBOT Stage DOM if not already present
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
  imgA.alt = 'NARION Product Render';
  tiltWrap.appendChild(imgA);

  var imgB = document.createElement('img');
  imgB.className = 'stage-img';
  imgB.id = 'stage-img-b';
  imgB.alt = 'NARION Product Render';
  tiltWrap.appendChild(imgB);

  stage.appendChild(tiltWrap);

  var floor = document.createElement('div');
  floor.className = 'stage-floor';
  stage.appendChild(floor);

  var badge = document.createElement('span');
  badge.className = 'stage-badge';
  badge.id = 'stage-badge';
  badge.textContent = 'NARION KOZA';
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
  var activeSlot = 'a'; // 'a' or 'b'
  var currentScale = 1.0;
  var targetScale = 1.0;

  // Load initial image
  imgA.src = MODELLER[currentModelId].image;
  imgB.src = MODELLER[currentModelId].image;

  // -------------------------------------------------------------
  // 3D Parallax & Tilt Effect (HBOT style)
  // -------------------------------------------------------------
  var isHovered = false;
  var currentTiltX = 0, currentTiltY = 0;
  var targetTiltX = 0, targetTiltY = 0;

  function updateTilt() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.1;
    currentTiltY += (targetTiltY - currentTiltY) * 0.1;
    currentScale += (targetScale - currentScale) * 0.1;

    tiltWrap.style.transform = 'rotateX(' + currentTiltX.toFixed(2) + 'deg) rotateY(' + currentTiltY.toFixed(2) + 'deg) scale(' + currentScale.toFixed(3) + ')';
    
    // Dynamic spotlight follow
    var spotX = 50 + currentTiltY * 1.5;
    var spotY = 28 - currentTiltX * 1.5;
    spotlight.style.background = 'radial-gradient(ellipse 75% 55% at ' + spotX.toFixed(1) + '% ' + spotY.toFixed(1) + '%, rgba(216, 187, 138, 0.22), rgba(255, 255, 255, 0.06) 45%, transparent 72%)';

    requestAnimationFrame(updateTilt);
  }
  requestAnimationFrame(updateTilt);

  stage.addEventListener('pointerenter', function () { isHovered = true; });
  stage.addEventListener('pointerleave', function () {
    isHovered = false;
    targetTiltX = 0;
    targetTiltY = 0;
  });

  stage.addEventListener('pointermove', function (e) {
    var rect = stage.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width;
    var y = (e.clientY - rect.top) / rect.height;

    targetTiltY = (x - 0.5) * 14; // Horizontal tilt
    targetTiltX = (0.5 - y) * 12; // Vertical tilt
  });

  // -------------------------------------------------------------
  // Model Switch with Smooth Crossfade
  // -------------------------------------------------------------
  function setModel(modelId) {
    if (!MODELLER[modelId] || modelId === currentModelId) return;
    currentModelId = modelId;
    var model = MODELLER[modelId];

    var incoming = activeSlot === 'a' ? imgB : imgA;
    var outgoing = activeSlot === 'a' ? imgA : imgB;

    incoming.src = model.image;
    incoming.classList.add('is-active');
    outgoing.classList.remove('is-active');

    activeSlot = activeSlot === 'a' ? 'b' : 'a';
    updateSummarySheet();
  }

  // -------------------------------------------------------------
  // View & Zoom Controls
  // -------------------------------------------------------------
  function setView(viewMode) {
    if (viewMode === 'yakin') {
      targetScale = 1.75;
      tiltWrap.style.transformOrigin = '50% 38%';
    } else {
      targetScale = 1.0;
      tiltWrap.style.transformOrigin = '50% 50%';
    }
  }

  // -------------------------------------------------------------
  // Update Specifications Sheet
  // -------------------------------------------------------------
  function updateSummarySheet() {
    var model = MODELLER[currentModelId] || MODELLER['narion-koza'];
    var finish = FINISHES[currentFinishId] || FINISHES['firca'];
    var wood = WOODS[currentWoodId] || WOODS['ceviz'];

    var elBadge = document.getElementById('stage-badge');
    if (elBadge) elBadge.textContent = 'NARION ' + model.name;

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
  // UI Event Listeners
  // -------------------------------------------------------------
  function bindEvents() {
    // Model Selection Cards
    var mCards = document.querySelectorAll('[data-model]');
    mCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var mId = card.getAttribute('data-model');
        if (!mId) return;
        mCards.forEach(function (c) { c.classList.remove('is-active'); });
        card.classList.add('is-active');
        setModel(mId);
      });
    });

    // Finish Selection Swatches
    var fSwatches = document.querySelectorAll('[data-kaplama]');
    fSwatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        var fId = sw.getAttribute('data-kaplama');
        if (!fId || !FINISHES[fId]) return;
        currentFinishId = fId;
        fSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        updateSummarySheet();
      });
    });

    // Wood Selection Swatches
    var wSwatches = document.querySelectorAll('[data-ahsap]');
    wSwatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        var wId = sw.getAttribute('data-ahsap');
        if (!wId || !WOODS[wId]) return;
        currentWoodId = wId;
        wSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        updateSummarySheet();
      });
    });

    // View Mode Toggle (Genel / Makro)
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

    // Zoom Buttons
    var btnZIn = document.getElementById('z-in');
    if (btnZIn) {
      btnZIn.addEventListener('click', function () {
        targetScale = Math.min(targetScale + 0.3, 2.4);
      });
    }

    var btnZOut = document.getElementById('z-out');
    if (btnZOut) {
      btnZOut.addEventListener('click', function () {
        targetScale = Math.max(targetScale - 0.3, 0.85);
      });
    }

    // High-Res Image Snapshot Download
    var btnDl = document.getElementById('v3-indir');
    if (btnDl) {
      btnDl.addEventListener('click', function () {
        var model = MODELLER[currentModelId] || MODELLER['narion-koza'];
        var link = document.createElement('a');
        link.download = currentModelId + '-' + currentFinishId + '-' + currentWoodId + '.webp';
        link.href = model.image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  bindEvents();
  updateSummarySheet();

})();
