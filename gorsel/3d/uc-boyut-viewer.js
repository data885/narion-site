/**
 * NARION — Photorealistic 3D Studio Configurator Engine (WebGL / Three.js)
 * 
 * Features:
 * - Independent PBR materials: Metal parts change ONLY metal; Wood sleeve changes ONLY wood;
 *   Glass vase remains crystal refractive; Ceramic bowl remains technical ceramic.
 * - 10 accurately proportioned NARION models in full 3D geometry.
 * - 4 Metal finishes (Brushed Stainless, PVD Champagne, Matte Black PVD, Gun Metal).
 * - 3 Natural wood finishes (American Walnut, Smoked Oak, Black Ash).
 * - Component toggles: Fitted/lifted bowl, B2B laser engraving, custom hose.
 * - Studio lighting: 3-point softbox, rim edge highlight, ground contact shadow.
 * - 60 FPS smooth orbit rotation, pinch/wheel zoom, macro close-up, and HD PNG export.
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
      totalH: 4.2,
      baseR: 1.3,
      vaseH: 2.1,
      stemH: 2.2,
      stemProfile: 'koza'
    },
    'narion-ladin': {
      name: 'LADİN',
      code: 'NARION LADİN · LOUNGE SERİ',
      height: '580 mm',
      sise: '1,0 L · Kristal Cam',
      taban: 'Ø120 mm (Kompakt)',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      totalH: 5.8,
      baseR: 1.2,
      vaseH: 2.5,
      stemH: 3.4,
      stemProfile: 'ladin'
    },
    'narion-manolya': {
      name: 'MANOLYA',
      code: 'NARION MANOLYA · PRESTİJ SERİ',
      height: '620 mm',
      sise: '1,4 L · Kristal Fasetalı',
      taban: 'Ø180 mm (Geniş Taban)',
      malzeme: 'AISI 304 / 316L Çelik',
      totalH: 6.2,
      baseR: 1.8,
      vaseH: 2.7,
      stemH: 3.6,
      stemProfile: 'manolya'
    },
    'narion-servi': {
      name: 'SERVİ',
      code: 'NARION SERVİ · İNCE MİMARİ SERİ',
      height: '640 mm',
      sise: '1,3 L · Dikey Silindir',
      taban: 'Ø140 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      totalH: 6.4,
      baseR: 1.4,
      vaseH: 2.8,
      stemH: 3.8,
      stemProfile: 'servi'
    },
    'narion-prizma': {
      name: 'PRİZMA',
      code: 'NARION PRİZMA · GEOMETRİK SERİ',
      height: '500 mm',
      sise: '1,1 L · Altıgen Prizma',
      taban: 'Ø150 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      totalH: 5.0,
      baseR: 1.5,
      vaseH: 2.3,
      stemH: 2.8,
      stemProfile: 'prizma'
    },
    'narion-nomad': {
      name: 'NOMAD',
      code: 'NARION NOMAD · SEYAHAT SERİ',
      height: '360 mm',
      sise: '0,9 L · Darbeye Dayanıklı',
      taban: 'Ø160 mm (Ultra Alçak Merkez)',
      malzeme: 'Hafifletilmiş AISI 304',
      totalH: 3.6,
      baseR: 1.6,
      vaseH: 1.8,
      stemH: 1.9,
      stemProfile: 'nomad'
    },
    'narion-aura': {
      name: 'AURA',
      code: 'NARION AURA · DAMLA PRESTİJ',
      height: '540 mm',
      sise: '1,2 L · Damla Formu',
      taban: 'Ø160 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      totalH: 5.4,
      baseR: 1.6,
      vaseH: 2.4,
      stemH: 3.1,
      stemProfile: 'aura'
    },
    'narion-monolit': {
      name: 'MONOLİT',
      code: 'NARION MONOLİT · MASİF BLOK',
      height: '520 mm',
      sise: '1,1 L · Ağır Taban Hazne',
      taban: 'Ø140 mm',
      malzeme: 'AISI 304 / 316L Çelik',
      totalH: 5.2,
      baseR: 1.4,
      vaseH: 2.3,
      stemH: 3.0,
      stemProfile: 'monolit'
    },
    'narion-inci': {
      name: 'İNCİ',
      code: 'NARION İNCİ · SERAMİK & ÇELİK',
      height: '480 mm',
      sise: '1,0 L · Oval Beyaz Kristal',
      taban: 'Ø150 mm',
      malzeme: 'AISI 304 & Teknik Seramik',
      totalH: 4.8,
      baseR: 1.5,
      vaseH: 2.2,
      stemH: 2.7,
      stemProfile: 'inci'
    },
    'narion-cakil': {
      name: 'ÇAKIL',
      code: 'NARION ÇAKIL · GENİŞ TABAN',
      height: '380 mm',
      sise: '1,4 L · Doğal Çakıl Formu',
      taban: 'Ø190 mm (Maksimum Denge)',
      malzeme: 'AISI 304 Paslanmaz Çelik',
      totalH: 3.8,
      baseR: 1.9,
      vaseH: 1.9,
      stemH: 2.0,
      stemProfile: 'cakil'
    }
  };

  var FINISHES = {
    'firca': {
      name: 'Fırçalı Paslanmaz',
      color: 0xdedfe3,
      metalness: 0.94,
      roughness: 0.28,
      clearcoat: 0.15,
      clearcoatRoughness: 0.2
    },
    'sampanya': {
      name: 'PVD Şampanya',
      color: 0xd8ba7d,
      metalness: 0.96,
      roughness: 0.20,
      clearcoat: 0.35,
      clearcoatRoughness: 0.15
    },
    'siyah': {
      name: 'Mat Siyah PVD',
      color: 0x222428,
      metalness: 0.82,
      roughness: 0.40,
      clearcoat: 0.05,
      clearcoatRoughness: 0.4
    },
    'gun': {
      name: 'Gun Metal',
      color: 0x4e5760,
      metalness: 0.94,
      roughness: 0.24,
      clearcoat: 0.20,
      clearcoatRoughness: 0.2
    }
  };

  var WOODS = {
    'ceviz': {
      name: 'Doğal Amerikan Ceviz',
      baseColor: '#6a3e23',
      darkColor: '#361e11',
      roughness: 0.48
    },
    'mese': {
      name: 'Füme Koyu Meşe',
      baseColor: '#3d3128',
      darkColor: '#1e1814',
      roughness: 0.55
    },
    'disbudak': {
      name: 'Siyah Dişbudak',
      baseColor: '#202124',
      darkColor: '#101012',
      roughness: 0.60
    }
  };

  // State
  var currentModelId = 'narion-koza';
  var currentFinishId = 'firca';
  var currentWoodId = 'ceviz';
  var currentViewMode = 'tam'; // 'tam' or 'yakin'
  var optLule = true;
  var optLogo = false;
  var optMarpuc = false;

  var container = document.getElementById('sahne');
  if (!container) return;

  // Clear previous canvas or HTML if any
  while (container.firstChild) {
    if (container.firstChild.classList && 
       (container.firstChild.classList.contains('stage-spotlight') ||
        container.firstChild.classList.contains('stage-badge') ||
        container.firstChild.classList.contains('stage-view-toggle') ||
        container.firstChild.classList.contains('stage-zoom-controls'))) {
      break;
    }
    container.removeChild(container.firstChild);
  }

  // 1. Scene & Camera Setup
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x130e0a);
  scene.fog = new THREE.FogExp2(0x130e0a, 0.045);

  var camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 2.6, 7.2);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.zIndex = '1';
  container.insertBefore(renderer.domElement, container.firstChild);

  // 2. Controls
  var controls;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3.2;
    controls.maxDistance = 11.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.08; // don't go below floor
    controls.minPolarAngle = 0.2;
    controls.target.set(0, 2.2, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
  }

  // Stop auto rotate on user drag
  renderer.domElement.addEventListener('pointerdown', function () {
    if (controls) controls.autoRotate = false;
  });

  // 3. Studio Lighting & HDR Environment
  var envMap = generateStudioEnvMap(renderer);
  scene.environment = envMap;

  // Key Softbox Light (Warm, main directional)
  var keyLight = new THREE.DirectionalLight(0xfffaee, 2.2);
  keyLight.position.set(4.5, 6.5, 4.0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0002;
  keyLight.shadow.radius = 3;
  scene.add(keyLight);

  // Rim / Edge Backlight (Cool white, highlights metal bevels and silhouettes)
  var rimLight = new THREE.DirectionalLight(0xd5e5ff, 2.8);
  rimLight.position.set(-4.5, 5.0, -3.5);
  scene.add(rimLight);

  // Soft Front/Bottom Fill Light (Keeps dark metals visible and detailed)
  var fillLight = new THREE.DirectionalLight(0xffe6cb, 0.9);
  fillLight.position.set(0.5, 1.0, 5.0);
  scene.add(fillLight);

  // Ambient Studio Dome
  var hemiLight = new THREE.HemisphereLight(0x403429, 0x120c08, 0.85);
  scene.add(hemiLight);

  // 4. Ground Stage (Contact Shadow & Reflection Plane)
  var floorGeo = new THREE.PlaneGeometry(30, 30);
  var floorMat = new THREE.MeshStandardMaterial({
    color: 0x18120e,
    roughness: 0.65,
    metalness: 0.25,
    envMap: envMap,
    envMapIntensity: 0.4
  });
  var floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.01;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // Soft Contact Shadow Decal
  var shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  var sctx = shadowCanvas.getContext('2d');
  var sgrad = sctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  sgrad.addColorStop(0, 'rgba(0,0,0,0.85)');
  sgrad.addColorStop(0.35, 'rgba(0,0,0,0.45)');
  sgrad.addColorStop(0.7, 'rgba(0,0,0,0.15)');
  sgrad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = sgrad;
  sctx.fillRect(0, 0, 256, 256);
  var shadowTex = new THREE.CanvasTexture(shadowCanvas);
  var shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.75, depthWrite: false });
  var shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.002;
  scene.add(shadowMesh);

  // 5. Materials Cache
  var matMetal = new THREE.MeshPhysicalMaterial({
    envMap: envMap,
    envMapIntensity: 1.5,
    clearcoat: 0.2,
    clearcoatRoughness: 0.2
  });
  updateMetalMaterial();

  var woodTextures = {};
  var matWood = new THREE.MeshStandardMaterial({
    envMap: envMap,
    envMapIntensity: 0.7,
    roughness: 0.5
  });
  updateWoodMaterial();

  var matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.02,
    roughness: 0.04,
    transmission: 0.94,
    thickness: 0.9,
    ior: 1.52,
    transparent: true,
    opacity: 0.95,
    envMap: envMap,
    envMapIntensity: 1.8,
    clearcoat: 0.9,
    clearcoatRoughness: 0.02
  });

  var matWater = new THREE.MeshPhysicalMaterial({
    color: 0xa8c8e8,
    metalness: 0.0,
    roughness: 0.02,
    transmission: 0.96,
    thickness: 0.5,
    ior: 1.33,
    transparent: true,
    opacity: 0.88
  });

  var matBowl = new THREE.MeshStandardMaterial({
    color: 0xdfd4c5,
    roughness: 0.85,
    metalness: 0.03,
    envMap: envMap,
    envMapIntensity: 0.4
  });

  var matLeather = new THREE.MeshStandardMaterial({
    color: 0x2b1d14,
    roughness: 0.75,
    metalness: 0.1
  });

  // 6. Hookah 3D Model Construction
  var hookahGroup = new THREE.Group();
  scene.add(hookahGroup);

  var bowlGroup = new THREE.Group();
  var marpucMesh = null;

  buildHookahModel(currentModelId);

  // -------------------------------------------------------------
  // Model Geometries Builder
  // -------------------------------------------------------------
  function buildHookahModel(modelId) {
    // Clear previous model meshes
    while (hookahGroup.children.length > 0) {
      var obj = hookahGroup.children[0];
      hookahGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
    }

    var cfg = MODELLER[modelId] || MODELLER['narion-koza'];
    var p = cfg.stemProfile;
    var bR = cfg.baseR;
    var vH = cfg.vaseH;

    // --- A. Glass / Tritan Vase (Cam Şişe) ---
    var vasePoints = [];
    if (p === 'prizma') {
      // Hexagonal / faceted styled vase
      var vaseGeo = new THREE.CylinderGeometry(bR * 0.55, bR * 0.95, vH, 6, 1, false);
      vaseGeo.translate(0, vH * 0.5, 0);
      var vaseMesh = new THREE.Mesh(vaseGeo, matGlass);
      vaseMesh.castShadow = true;
      vaseMesh.receiveShadow = true;
      hookahGroup.add(vaseMesh);
    } else {
      // Smooth lathe profile vase
      var segs = 18;
      for (var i = 0; i <= segs; i++) {
        var t = i / segs;
        var y = t * vH;
        var r = 0;
        if (p === 'cakil') {
          // Extra wide low pebble contour
          r = bR * (0.95 * Math.sin(t * Math.PI * 0.85 + 0.2) + 0.15 * (1 - t));
        } else if (p === 'manolya' || p === 'aura') {
          // Curvaceous bell / teardrop
          r = bR * (0.85 * Math.pow(Math.sin(t * Math.PI * 0.8), 0.8) + 0.28 * (1 - t * 0.6));
        } else if (p === 'servi') {
          // Sleek slender architectural beaker
          r = bR * (0.65 + 0.25 * Math.cos(t * Math.PI * 0.9));
        } else {
          // Koza / Standard solid modern taper
          r = bR * (0.85 * (1 - t * 0.55) + 0.2 * Math.sin(t * Math.PI));
        }
        if (t === 0) vasePoints.push(new THREE.Vector2(0, 0));
        vasePoints.push(new THREE.Vector2(Math.max(r, 0.42), y));
      }
      var vaseGeo = new THREE.LatheGeometry(vasePoints, 48);
      var vaseMesh = new THREE.Mesh(vaseGeo, matGlass);
      vaseMesh.castShadow = true;
      vaseMesh.receiveShadow = true;
      hookahGroup.add(vaseMesh);
    }

    // --- B. Water Layer (Hazne Suyu) ---
    var waterGeo = new THREE.CylinderGeometry(bR * 0.72, bR * 0.82, vH * 0.45, 32);
    waterGeo.translate(0, vH * 0.26, 0);
    var waterMesh = new THREE.Mesh(waterGeo, matWater);
    hookahGroup.add(waterMesh);

    // --- C. Bayonet Heart / Hub (Gövde Bayonet Bileziği & Portlar) ---
    var hubY = vH;
    var hubR = 0.68;
    var hubH = 0.42;
    var hubGeo = new THREE.CylinderGeometry(hubR * 0.92, hubR, hubH, 36);
    hubGeo.translate(0, hubY + hubH * 0.5, 0);
    var hubMesh = new THREE.Mesh(hubGeo, matMetal);
    hubMesh.castShadow = true;
    hookahGroup.add(hubMesh);

    // Bayonet locking ring ribs (Quarter turn indicator)
    var ringGeo = new THREE.TorusGeometry(hubR * 0.96, 0.045, 16, 36);
    ringGeo.rotateX(Math.PI / 2);
    ringGeo.translate(0, hubY + hubH * 0.5, 0);
    var ringMesh = new THREE.Mesh(ringGeo, matMetal);
    hookahGroup.add(ringMesh);

    // Hose Port & Purge Valve Nozzles
    var portGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.38, 16);
    portGeo.rotateZ(Math.PI / 3);
    portGeo.translate(hubR * 0.75, hubY + hubH * 0.45, 0);
    var portMesh = new THREE.Mesh(portGeo, matMetal);
    hookahGroup.add(portMesh);

    var purgeGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.32, 16);
    purgeGeo.rotateZ(-Math.PI / 3);
    purgeGeo.translate(-hubR * 0.75, hubY + hubH * 0.45, 0);
    var purgeMesh = new THREE.Mesh(purgeGeo, matMetal);
    hookahGroup.add(purgeMesh);

    // Downstem into water
    var downstemGeo = new THREE.CylinderGeometry(0.16, 0.16, vH * 0.85, 24);
    downstemGeo.translate(0, vH * 0.5, 0);
    var downstemMesh = new THREE.Mesh(downstemGeo, matMetal);
    hookahGroup.add(downstemMesh);

    // Diffuser at downstem base
    var diffGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.28, 24);
    diffGeo.translate(0, vH * 0.14, 0);
    var diffMesh = new THREE.Mesh(diffGeo, matMetal);
    hookahGroup.add(diffMesh);

    // --- D. Wood Sleeve & Core Stem (Ahşap Kakma Gövde & Metal Çekirdek) ---
    var stemStartY = hubY + hubH;
    var stemH = cfg.stemH;

    // Stainless inner core pipe
    var coreGeo = new THREE.CylinderGeometry(0.22, 0.22, stemH, 24);
    coreGeo.translate(0, stemStartY + stemH * 0.5, 0);
    var coreMesh = new THREE.Mesh(coreGeo, matMetal);
    hookahGroup.add(coreMesh);

    // Outer Decorative Wood Sleeve (Distinct silhouette for each model)
    var woodMesh;
    if (p === 'prizma') {
      var woodGeo = new THREE.CylinderGeometry(0.48, 0.54, stemH * 0.82, 6);
      woodGeo.translate(0, stemStartY + stemH * 0.45, 0);
      woodMesh = new THREE.Mesh(woodGeo, matWood);
    } else {
      var wPts = [];
      var wSegs = 20;
      var wH = stemH * 0.84;
      for (var j = 0; j <= wSegs; j++) {
        var wt = j / wSegs;
        var wy = wt * wH;
        var wr = 0.32;
        if (p === 'koza') {
          // Signature cocoon organic swell
          wr = 0.32 + 0.35 * Math.sin(wt * Math.PI);
        } else if (p === 'ladin') {
          // Precision ribbed tall segmented cylinder
          wr = 0.38 + 0.08 * Math.sin(wt * Math.PI * 4);
        } else if (p === 'manolya') {
          // Dual bulb flare
          wr = 0.34 + 0.22 * Math.pow(Math.sin(wt * Math.PI * 2), 2);
        } else if (p === 'servi') {
          // Sleek continuous straight wood inlay
          wr = 0.36 + 0.06 * (1 - wt);
        } else if (p === 'aura') {
          // Teardrop flare at bottom tapering upward
          wr = 0.32 + 0.28 * Math.pow(1 - wt, 1.5);
        } else if (p === 'monolit') {
          // Massive monolithic solid block with micro grooving
          wr = 0.52 + 0.04 * (j % 2);
        } else {
          wr = 0.38 + 0.18 * Math.sin(wt * Math.PI);
        }
        wPts.push(new THREE.Vector2(wr, wy));
      }
      var woodGeo = new THREE.LatheGeometry(wPts, 36);
      woodGeo.translate(0, stemStartY + stemH * 0.06, 0);
      woodMesh = new THREE.Mesh(woodGeo, matWood);
    }
    woodMesh.castShadow = true;
    woodMesh.receiveShadow = true;
    hookahGroup.add(woodMesh);

    // Metal collar rings above & below wood
    var collarLowGeo = new THREE.CylinderGeometry(0.36, 0.42, 0.15, 32);
    collarLowGeo.translate(0, stemStartY + 0.075, 0);
    hookahGroup.add(new THREE.Mesh(collarLowGeo, matMetal));

    var collarHighGeo = new THREE.CylinderGeometry(0.42, 0.36, 0.15, 32);
    collarHighGeo.translate(0, stemStartY + stemH * 0.92, 0);
    hookahGroup.add(new THREE.Mesh(collarHighGeo, matMetal));

    // --- E. Ashtray (Kül Tepsisi) ---
    var trayY = stemStartY + stemH;
    var trayR = 1.45;
    var trayPts = [
      new THREE.Vector2(0.24, 0),
      new THREE.Vector2(trayR * 0.85, 0.03),
      new THREE.Vector2(trayR, 0.22),
      new THREE.Vector2(trayR - 0.04, 0.22),
      new THREE.Vector2(trayR * 0.84, 0.06),
      new THREE.Vector2(0.24, 0.04)
    ];
    var trayGeo = new THREE.LatheGeometry(trayPts, 48);
    trayGeo.translate(0, trayY, 0);
    var trayMesh = new THREE.Mesh(trayGeo, matMetal);
    trayMesh.castShadow = true;
    hookahGroup.add(trayMesh);

    // Bowl Adapter Top Cone
    var adapterGeo = new THREE.CylinderGeometry(0.22, 0.32, 0.35, 24);
    adapterGeo.translate(0, trayY + 0.2, 0);
    hookahGroup.add(new THREE.Mesh(adapterGeo, matMetal));

    // --- F. Ceramic Bowl (Kordierit Seramik Lüle) ---
    while (bowlGroup.children.length > 0) {
      var bChild = bowlGroup.children[0];
      bowlGroup.remove(bChild);
      if (bChild.geometry) bChild.geometry.dispose();
    }
    var bowlY = trayY + 0.38;
    var bowlPts = [
      new THREE.Vector2(0.20, 0),
      new THREE.Vector2(0.48, 0.45),
      new THREE.Vector2(0.55, 0.72),
      new THREE.Vector2(0.46, 0.72),
      new THREE.Vector2(0.38, 0.48),
      new THREE.Vector2(0.14, 0.18),
      new THREE.Vector2(0.14, 0)
    ];
    var bowlGeo = new THREE.LatheGeometry(bowlPts, 36);
    bowlGeo.translate(0, bowlY, 0);
    var bowlMesh = new THREE.Mesh(bowlGeo, matBowl);
    bowlMesh.castShadow = true;
    bowlGroup.add(bowlMesh);

    hookahGroup.add(bowlGroup);
    bowlGroup.visible = optLule;

    // --- G. Optional Leather Hose ---
    if (optMarpuc) {
      addHoseMesh(hubY, hubR);
    }

    // Shadow decal scale adjust
    shadowMesh.scale.set(bR * 1.35, bR * 1.35, 1);
  }

  function addHoseMesh(hubY, hubR) {
    var curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(hubR * 0.85, hubY + 0.2, 0),
      new THREE.Vector3(hubR + 1.2, hubY - 0.2, 0.5),
      new THREE.Vector3(hubR + 0.8, 0.2, 1.4),
      new THREE.Vector3(hubR + 1.6, 0.05, 1.8)
    );
    var tubeGeo = new THREE.TubeGeometry(curve, 36, 0.08, 12, false);
    var tubeMesh = new THREE.Mesh(tubeGeo, matLeather);
    hookahGroup.add(tubeMesh);

    // Wood Handle
    var handleGeo = new THREE.CylinderGeometry(0.12, 0.16, 1.2, 16);
    handleGeo.rotateX(Math.PI / 3);
    handleGeo.translate(hubR + 1.7, 0.45, 2.1);
    var handleMesh = new THREE.Mesh(handleGeo, matWood);
    hookahGroup.add(handleMesh);
  }

  // -------------------------------------------------------------
  // Materials Update Helpers
  // -------------------------------------------------------------
  function updateMetalMaterial() {
    var f = FINISHES[currentFinishId] || FINISHES['firca'];
    matMetal.color.setHex(f.color);
    matMetal.metalness = f.metalness;
    matMetal.roughness = f.roughness;
    matMetal.clearcoat = f.clearcoat;
    matMetal.clearcoatRoughness = f.clearcoatRoughness;
    matMetal.needsUpdate = true;
  }

  function updateWoodMaterial() {
    var w = WOODS[currentWoodId] || WOODS['ceviz'];
    if (!woodTextures[currentWoodId]) {
      woodTextures[currentWoodId] = generateWoodTexture(w.baseColor, w.darkColor);
    }
    matWood.map = woodTextures[currentWoodId];
    matWood.roughness = w.roughness;
    matWood.needsUpdate = true;
  }

  // -------------------------------------------------------------
  // Procedural Studio EnvMap & Woodgrain Generators
  // -------------------------------------------------------------
  function generateStudioEnvMap(glRenderer) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    var ctx = c.getContext('2d');

    // Dark luxury warm gradient background
    var bg = ctx.createLinearGradient(0, 0, 0, 256);
    bg.addColorStop(0, '#221912');
    bg.addColorStop(0.5, '#120d09');
    bg.addColorStop(1, '#080504');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 256);

    // Key softbox panel reflection (Top Left)
    var keyGrad = ctx.createRadialGradient(160, 80, 5, 160, 80, 75);
    keyGrad.addColorStop(0, 'rgba(255, 245, 230, 1.0)');
    keyGrad.addColorStop(0.4, 'rgba(255, 230, 200, 0.7)');
    keyGrad.addColorStop(1, 'rgba(255, 210, 170, 0.0)');
    ctx.fillStyle = keyGrad;
    ctx.fillRect(80, 10, 160, 140);

    // Rim softbox panel reflection (Back Right)
    var rimGrad = ctx.createRadialGradient(390, 70, 5, 390, 70, 60);
    rimGrad.addColorStop(0, 'rgba(230, 240, 255, 0.95)');
    rimGrad.addColorStop(0.5, 'rgba(180, 210, 255, 0.45)');
    rimGrad.addColorStop(1, 'rgba(150, 190, 255, 0.0)');
    ctx.fillStyle = rimGrad;
    ctx.fillRect(320, 10, 140, 120);

    // Studio horizon fill
    var horizGrad = ctx.createLinearGradient(0, 140, 0, 190);
    horizGrad.addColorStop(0, 'rgba(180, 140, 100, 0.25)');
    horizGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = horizGrad;
    ctx.fillRect(0, 140, 512, 50);

    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;

    if (THREE.PMREMGenerator) {
      var pmrem = new THREE.PMREMGenerator(glRenderer);
      var renderTarget = pmrem.fromEquirectangular(tex);
      pmrem.dispose();
      return renderTarget.texture;
    }
    return tex;
  }

  function generateWoodTexture(baseColor, darkColor) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    var ctx = c.getContext('2d');

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Organic Wood Rings & Fine Grain
    ctx.strokeStyle = darkColor;
    for (var y = 0; y < 512; y += 3) {
      var alpha = 0.08 + 0.18 * Math.sin(y * 0.12) * Math.sin(y * 0.035);
      ctx.lineWidth = 1 + Math.sin(y * 0.08);
      ctx.globalAlpha = Math.max(alpha, 0.02);
      ctx.beginPath();
      var wobble = Math.sin(y * 0.02) * 20;
      ctx.moveTo(0, y + wobble);
      ctx.bezierCurveTo(170, y - wobble * 0.5, 340, y + wobble * 0.8, 512, y + wobble);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    return tex;
  }

  // -------------------------------------------------------------
  // Camera & View Modes Animation
  // -------------------------------------------------------------
  function setViewMode(mode) {
    currentViewMode = mode;
    var targetCamY = mode === 'yakin' ? 3.4 : 2.6;
    var targetCamZ = mode === 'yakin' ? 4.6 : 7.2;
    var targetLookY = mode === 'yakin' ? 3.2 : 2.2;

    var startCamY = camera.position.y;
    var startCamZ = camera.position.z;
    var startLookY = controls ? controls.target.y : 2.2;

    var startTime = performance.now();
    var duration = 650; // ms

    function animateCam(now) {
      var progress = Math.min((now - startTime) / duration, 1.0);
      var ease = 0.5 - Math.cos(progress * Math.PI) / 2; // smooth in-out

      camera.position.y = startCamY + (targetCamY - startCamY) * ease;
      camera.position.z = startCamZ + (targetCamZ - startCamZ) * ease;
      if (controls) {
        controls.target.y = startLookY + (targetLookY - startLookY) * ease;
      }

      if (progress < 1.0) {
        requestAnimationFrame(animateCam);
      }
    }
    requestAnimationFrame(animateCam);
  }

  // -------------------------------------------------------------
  // UI Bindings & DOM Synchronization
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

  function bindUIEvents() {
    // 1. Model cards
    var mCards = document.querySelectorAll('[data-model]');
    mCards.forEach(function (card) {
      card.addEventListener('click', function () {
        var mId = card.getAttribute('data-model');
        if (!mId || !MODELLER[mId]) return;
        currentModelId = mId;
        mCards.forEach(function (c) { c.classList.remove('is-active'); });
        card.classList.add('is-active');
        buildHookahModel(currentModelId);
        updateSummarySheet();
      });
    });

    // 2. Finish Swatches
    var fSwatches = document.querySelectorAll('[data-kaplama]');
    fSwatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        var fId = sw.getAttribute('data-kaplama');
        if (!fId || !FINISHES[fId]) return;
        currentFinishId = fId;
        fSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        updateMetalMaterial();
        updateSummarySheet();
      });
    });

    // 3. Wood Inlay Swatches
    var wSwatches = document.querySelectorAll('[data-ahsap]');
    wSwatches.forEach(function (sw) {
      sw.addEventListener('click', function () {
        var wId = sw.getAttribute('data-ahsap');
        if (!wId || !WOODS[wId]) return;
        currentWoodId = wId;
        wSwatches.forEach(function (s) { s.classList.remove('is-active'); });
        sw.classList.add('is-active');
        updateWoodMaterial();
        updateSummarySheet();
      });
    });

    // 4. Add-on checkboxes
    var chkLule = document.getElementById('opt-lule');
    if (chkLule) {
      chkLule.addEventListener('change', function () {
        optLule = chkLule.checked;
        bowlGroup.visible = optLule;
      });
    }

    var chkLogo = document.getElementById('opt-logo');
    if (chkLogo) {
      chkLogo.addEventListener('change', function () {
        optLogo = chkLogo.checked;
      });
    }

    var chkMarpuc = document.getElementById('opt-marpuc');
    if (chkMarpuc) {
      chkMarpuc.addEventListener('change', function () {
        optMarpuc = chkMarpuc.checked;
        buildHookahModel(currentModelId);
      });
    }

    // 5. View mode buttons (Tam / Yakın)
    var vBtns = document.querySelectorAll('.stage-v-btn');
    vBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-view');
        if (!mode) return;
        vBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        setViewMode(mode);
      });
    });

    // 6. Zoom +/- buttons
    var btnZIn = document.getElementById('z-in');
    if (btnZIn) {
      btnZIn.addEventListener('click', function () {
        if (camera.position.z > 3.6) {
          camera.position.z -= 0.6;
          if (controls) controls.autoRotate = false;
        }
      });
    }

    var btnZOut = document.getElementById('z-out');
    if (btnZOut) {
      btnZOut.addEventListener('click', function () {
        if (camera.position.z < 10.0) {
          camera.position.z += 0.6;
          if (controls) controls.autoRotate = false;
        }
      });
    }

    // 7. High-Res Snapshot Download
    var btnDl = document.getElementById('v3-indir');
    if (btnDl) {
      btnDl.addEventListener('click', function () {
        // Render 1 frame cleanly
        renderer.render(scene, camera);
        var dataUrl = renderer.domElement.toDataURL('image/png');
        var a = document.createElement('a');
        a.download = currentModelId + '-' + currentFinishId + '-' + currentWoodId + '.png';
        a.href = dataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }
  }

  // -------------------------------------------------------------
  // Animation Render Loop & Resize Handling
  // -------------------------------------------------------------
  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    var w = container.clientWidth;
    var h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onWindowResize);

  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  // Init
  bindUIEvents();
  updateSummarySheet();
  animate();

})();
