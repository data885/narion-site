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
      code: 'NARION KOZA · LOKOMOTİF SERİ',
      height: '420 mm',
      sise: '750 ml',
      taban: 'Ø150 mm (Geniş Sarsılmaz Denge)',
      malzeme: 'AISI 304 Paslanmaz Çelik & Masif Ceviz',
      hasWood: true
    },
    'narion-ladin': {
      name: 'LADİN',
      code: 'NARION LADİN · LOKOMOTİF SERİ',
      height: '580 mm',
      sise: '850 ml · Tritan',
      taban: 'Ø160 mm',
      malzeme: 'AISI 304 Paslanmaz Çelik & Balıksırtı Ahşap',
      hasWood: true
    },
    'narion-manolya': {
      name: 'MANOLYA',
      code: 'NARION MANOLYA · LOKOMOTİF SERİ',
      height: '620 mm',
      sise: '800 ml · Tritan',
      taban: 'Ø155 mm',
      malzeme: 'AISI 304 / 316L Çelik & Ahşap Bilezik',
      hasWood: true
    },
    'narion-servi': {
      name: 'SERVİ',
      code: 'NARION SERVİ · KLASİK & PRESTİJ',
      height: '680 mm',
      sise: '950 ml · Tritan',
      taban: 'Ø170 mm',
      malzeme: 'Tornalanmış Masif Ahşap Gövde & Çelik',
      hasWood: true
    },
    'narion-prizma': {
      name: 'PRİZMA',
      code: 'NARION PRİZMA · TEKNOLOJİ SERİSİ',
      height: '510 mm',
      sise: '700 ml · Tritan',
      taban: 'Ø150 mm (Altıgen Kaide)',
      malzeme: 'AISI 304 / Eloksallı Titanyum',
      hasWood: false,
      woodNote: 'PRİZMA monolitik geometrik metal gövdedir (Ahşap panel içermez).'
    },
    'narion-nomad': {
      name: 'NOMAD',
      code: 'NARION NOMAD · TEKNOLOJİ SERİSİ',
      height: '350 mm',
      sise: '450 ml · Tritan',
      taban: 'Ø140 mm (Alçak Denge)',
      malzeme: 'Hafifletilmiş Metal & Koruma Kılıfı',
      hasWood: false,
      woodNote: 'NOMAD seyahat serisi yekpare hafifletilmiş metal alaşımdır (Ahşap panel içermez).'
    },
    'narion-aura': {
      name: 'AURA',
      code: 'NARION AURA · KLASİK & PRESTİJ',
      height: '600 mm',
      sise: '850 ml · Tritan',
      taban: 'Ø160 mm',
      malzeme: 'PVD Pirinç Kanatlar & Ceviz İç Kaplama',
      hasWood: true
    },
    'narion-monolit': {
      name: 'MONOLİT',
      code: 'NARION MONOLİT · KLASİK & PRESTİJ',
      height: '550 mm',
      sise: '800 ml · Tritan',
      taban: 'Ø165 mm (Ağır Mermer Kaide)',
      malzeme: 'Masif Ahşap Kolon & Pirinç / Mermer Taban',
      hasWood: true
    },
    'narion-inci': {
      name: 'İNCİ',
      code: 'NARION İNCİ · KLASİK & PRESTİJ',
      height: '480 mm',
      sise: '700 ml · Tritan',
      taban: 'Ø150 mm',
      malzeme: 'Fırınlanmış Teknik Seramik & Pirinç',
      hasWood: false,
      woodNote: 'İNCİ modeli fırınlanmış teknik seramik gövdelidir (Ahşap panel içermez).'
    },
    'narion-cakil': {
      name: 'ÇAKIL',
      code: 'NARION ÇAKIL · MODERN SERİ',
      height: '380 mm',
      sise: '600 ml · Tritan',
      taban: 'Ø165 mm (Alçak Denge)',
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

  var lang = (document.documentElement.lang || 'tr').toLowerCase();
  if (['en', 'ar', 'ru', 'tr'].indexOf(lang) === -1) {
    lang = 'tr';
  }

  var I18N = {
    tr: {
      views: {
        tam: 'Stüdyo Ön (3B)',
        perspektif: '3/4 Perspektif',
        kutu: 'Kutulama & VIP',
        makro: 'Bayonet Makro'
      },
      zoomIn: 'Yakınlaştır',
      zoomOut: 'Uzaklaştır',
      perspectiveBadge: function (name) { return 'NARION ' + name + ' · 3/4 DİNAMİK PERSPEKTİF AÇISI'; },
      boxBadgeNomad: 'NARION NOMAD · TAKTİK SEYAHAT KUTUSU',
      boxBadgeDefault: 'NARION · VIP SERT SUNUM KUTUSU & UNBOXING',
      macroBadge: 'NARION · CNC BAYONET KİLİT & CEVİZ İŞÇİLİĞİ',
      woodNoteActive: 'Doğal fırınlanmış sert ağaç panel; suya ve ısıya karşı özel emprenye korumalıdır.',
      woodNoteDisabledDefault: 'Bu modelde ahşap panel opsiyonu bulunmaz.',
      noWoodSummary: 'Gövde Yekpare (Ahşap Yok)',
      finishes: {
        firca: { name: 'Fırçalı Paslanmaz', spec: 'AISI 304 / 316L Satin' },
        sampanya: { name: 'PVD Şampanya', spec: 'Lüks Pirinç & Altın PVD' },
        siyah: { name: 'Mat Siyah PVD', spec: 'Obsidyen Titanyum Kaplama' },
        gun: { name: 'Gun Metal', spec: 'Koyu Grafit Metalik' }
      },
      woods: {
        ceviz: { name: 'Doğal Amerikan Ceviz', spec: 'Derin Damarlı Ahşap' },
        mese: { name: 'Füme Koyu Meşe', spec: 'Mat İsli Meşe Dokusu' },
        disbudak: { name: 'Siyah Dişbudak', spec: 'Siyah Ahşap Greni' }
      },
      models: {
        'narion-koza': { code: 'NARION KOZA · LOKOMOTİF SERİ', taban: 'Ø150 mm (Geniş Sarsılmaz Denge)', malzeme: 'AISI 304 Paslanmaz Çelik & Masif Ceviz' },
        'narion-ladin': { code: 'NARION LADİN · LOKOMOTİF SERİ', taban: 'Ø160 mm', malzeme: 'AISI 304 Paslanmaz Çelik & Balıksırtı Ahşap' },
        'narion-manolya': { code: 'NARION MANOLYA · LOKOMOTİF SERİ', taban: 'Ø155 mm', malzeme: 'AISI 304 / 316L Çelik & Ahşap Bilezik' },
        'narion-servi': { code: 'NARION SERVİ · KLASİK & PRESTİJ', taban: 'Ø170 mm', malzeme: 'Tornalanmış Masif Ahşap Gövde & Çelik' },
        'narion-prizma': { code: 'NARION PRİZMA · TEKNOLOJİ SERİSİ', taban: 'Ø150 mm (Altıgen Kaide)', malzeme: 'AISI 304 / Eloksallı Titanyum', woodNote: 'PRİZMA monolitik geometrik metal gövdedir (Ahşap panel içermez).' },
        'narion-nomad': { code: 'NARION NOMAD · TEKNOLOJİ SERİSİ', taban: 'Ø140 mm (Alçak Denge)', malzeme: 'Hafifletilmiş Metal & Koruma Kılıfı', woodNote: 'NOMAD seyahat serisi yekpare hafifletilmiş metal alaşımdır (Ahşap panel içermez).' },
        'narion-aura': { code: 'NARION AURA · KLASİK & PRESTİJ', taban: 'Ø160 mm', malzeme: 'PVD Pirinç Kanatlar & Ceviz İç Kaplama' },
        'narion-monolit': { code: 'NARION MONOLİT · KLASİK & PRESTİJ', taban: 'Ø165 mm (Ağır Mermer Kaide)', malzeme: 'Masif Ahşap Kolon & Pirinç / Mermer Taban' },
        'narion-inci': { code: 'NARION İNCİ · KLASİK & PRESTİJ', taban: 'Ø150 mm', malzeme: 'Fırınlanmış Teknik Seramik & Pirinç', woodNote: 'İNCİ modeli fırınlanmış teknik seramik gövdelidir (Ahşap panel içermez).' },
        'narion-cakil': { code: 'NARION ÇAKIL · MODERN SERİ', taban: 'Ø165 mm (Alçak Denge)', malzeme: 'Yekpare Döküm Mineral / Gun Metal Gövde', woodNote: 'ÇAKIL akarsu taşından esinlenen tek kütle mineral/metal gövdedir (Ahşap panel içermez).' }
      }
    },
    en: {
      views: {
        tam: 'Studio Front (3D)',
        perspektif: '3/4 Perspective',
        kutu: 'Packaging & VIP',
        makro: 'Bayonet Macro'
      },
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      perspectiveBadge: function (name) { return 'NARION ' + name + ' · 3/4 DYNAMIC PERSPECTIVE'; },
      boxBadgeNomad: 'NARION NOMAD · TACTICAL TRAVEL CASE',
      boxBadgeDefault: 'NARION · VIP RIGID PRESENTATION CASE & UNBOXING',
      macroBadge: 'NARION · CNC BAYONET LOCK & WALNUT CRAFTSMANSHIP',
      woodNoteActive: 'A kiln-dried hardwood panel, specially impregnated against water and heat.',
      woodNoteDisabledDefault: 'This model does not feature wood panels.',
      noWoodSummary: 'Solid Body (No Wood)',
      finishes: {
        firca: { name: 'Brushed Stainless', spec: 'AISI 304 / 316L satin' },
        sampanya: { name: 'Champagne PVD', spec: 'Luxury brass & gold PVD' },
        siyah: { name: 'Matte black PVD', spec: 'Obsidian titanium finish' },
        gun: { name: 'Gunmetal', spec: 'Dark graphite metallic' }
      },
      woods: {
        ceviz: { name: 'Natural American walnut', spec: 'Deep-grain timber' },
        mese: { name: 'Smoked dark oak', spec: 'Matte smoked oak texture' },
        disbudak: { name: 'Black ash', spec: 'Black wood grain' }
      },
      models: {
        'narion-koza': { code: 'NARION KOZA · LEAD SERIES', taban: 'Ø150 mm (wide, stable footprint)', malzeme: 'AISI 304 stainless steel & solid walnut' },
        'narion-ladin': { code: 'NARION LADİN · LEAD SERIES', taban: 'Ø160 mm', malzeme: 'AISI 304 stainless steel & herringbone wood' },
        'narion-manolya': { code: 'NARION MANOLYA · LEAD SERIES', taban: 'Ø155 mm', malzeme: 'AISI 304 / 316L steel & wood collar' },
        'narion-servi': { code: 'NARION SERVİ · CLASSIC & PRESTIGE', taban: 'Ø170 mm', malzeme: 'Turned solid wood column & steel' },
        'narion-prizma': { code: 'NARION PRİZMA · TECHNOLOGY SERIES', taban: 'Ø150 mm (hexagonal footprint)', malzeme: 'AISI 304 / anodized titanium', woodNote: 'PRİZMA is a monolithic geometric metal body (no wood panel).' },
        'narion-nomad': { code: 'NARION NOMAD · TECHNOLOGY SERIES', taban: 'Ø140 mm (low center of gravity)', malzeme: 'Lightweight alloy & protective pouch', woodNote: 'NOMAD travel series is a one-piece lightweight alloy (no wood panel).' },
        'narion-aura': { code: 'NARION AURA · CLASSIC & PRESTIGE', taban: 'Ø160 mm', malzeme: 'PVD brass wings & walnut core' },
        'narion-monolit': { code: 'NARION MONOLİT · CLASSIC & PRESTIGE', taban: 'Ø165 mm (heavy marble base)', malzeme: 'Solid wood column & brass / marble base' },
        'narion-inci': { code: 'NARION İNCİ · CLASSIC & PRESTIGE', taban: 'Ø150 mm', malzeme: 'Kiln-fired technical ceramic & brass', woodNote: 'İNCİ features a kiln-fired technical ceramic body (no wood panel).' },
        'narion-cakil': { code: 'NARION ÇAKIL · MODERN SERIES', taban: 'Ø165 mm (low profile)', malzeme: 'Cast mineral / gunmetal body', woodNote: 'ÇAKIL is a river-stone inspired single-mass mineral/metal body (no wood panel).' }
      }
    },
    ar: {
      views: {
        tam: 'عرض الاستوديو (3B)',
        perspektif: 'منظور 3/4',
        kutu: 'التغليف وVIP',
        makro: 'ماكرو البايونيت'
      },
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      perspectiveBadge: function (name) { return 'NARION ' + name + ' · منظور ديناميكي 3/4'; },
      boxBadgeNomad: 'NARION NOMAD · حقيبة سفر تكتيكية',
      boxBadgeDefault: 'NARION · علبة تقديم صلبة VIP وفتح العلبة',
      macroBadge: 'NARION · قفل بايونيت CNC وحرفية خشب الجوز',
      woodNoteActive: 'لوح خشب صلب مجفف في الفرن؛ معالج خصيصًا ضد الرطوبة والحرارة.',
      woodNoteDisabledDefault: 'لا يتوفر خيار الألواح الخشبية في هذا الطراز.',
      noWoodSummary: 'هيكل متجانس (بدون خشب)',
      finishes: {
        firca: { name: 'فولاذ مقاوم للصدأ مصقول', spec: 'AISI 304 / 316L ساتان' },
        sampanya: { name: 'شمبانيا PVD', spec: 'نحاس وذهب PVD فاخر' },
        siyah: { name: 'أسود مطفي PVD', spec: 'طلاء تيتانيوم سبجي' },
        gun: { name: 'جون ميتال', spec: 'غرافيت داكن معدني' }
      },
      woods: {
        ceviz: { name: 'جوز أمريكي طبيعي', spec: 'خشب بحبيبات عميقة' },
        mese: { name: 'بلوط داكن مدخن', spec: 'ملمس بلوط مدخن مطفي' },
        disbudak: { name: 'مران أسود', spec: 'حبيبات خشبية سوداء' }
      },
      models: {
        'narion-koza': { code: 'NARION KOZA · السلسلة الأولى', taban: 'Ø150 ملم (قاعدة عريضة ثابتة)', malzeme: 'فولاذ مقاوم للصدأ AISI 304 وجوز صلب' },
        'narion-ladin': { code: 'NARION LADİN · السلسلة الأولى', taban: 'Ø160 ملم', malzeme: 'فولاذ AISI 304 وخشب متعرج' },
        'narion-manolya': { code: 'NARION MANOLYA · السلسلة الأولى', taban: 'Ø155 ملم', malzeme: 'فولاذ AISI 304 / 316L وحلقة خشبية' },
        'narion-servi': { code: 'NARION SERVİ · كلاسيك وبرستيج', taban: 'Ø170 ملم', malzeme: 'عمود خشب صلب مخروط وفولاذ' },
        'narion-prizma': { code: 'NARION PRİZMA · سلسلة التكنولوجيا', taban: 'Ø150 ملم (قاعدة سداسية)', malzeme: 'AISI 304 / تيتانيوم مؤكسد', woodNote: 'PRİZMA هيكل معدني هندسي متجانس (بدون خشب).' },
        'narion-nomad': { code: 'NARION NOMAD · سلسلة التكنولوجيا', taban: 'Ø140 ملم (توازن منخفض)', malzeme: 'سبائك معدنية خفيفة وحقيبة حماية', woodNote: 'NOMAD سلسلة السفر سبيكة معدنية خفيفة متجانسة (بدون خشب).' },
        'narion-aura': { code: 'NARION AURA · كلاسيك وبرستيج', taban: 'Ø160 ملم', malzeme: 'أجنحة نحاس PVD وقلب جوز' },
        'narion-monolit': { code: 'NARION MONOLİT · كلاسيك وبرستيج', taban: 'Ø165 ملم (قاعدة رخامية ثقيلة)', malzeme: 'عمود خشب صلب وقاعدة نحاس/رخام' },
        'narion-inci': { code: 'NARION İNCİ · كلاسيك وبرستيج', taban: 'Ø150 ملم', malzeme: 'خزف تقني معالج بالحرارة ونحاس', woodNote: 'طراز İNCİ يتميز بهيكل خزفي تقني (بدون خشب).' },
        'narion-cakil': { code: 'NARION ÇAKIL · السلسلة الحديثة', taban: 'Ø165 ملم (توازن منخفض)', malzeme: 'معدن مصبوب متجانس / جون ميتال', woodNote: 'ÇAKIL هيكل متجانس مستوحى من حصى النهر (بدون خشب).' }
      }
    },
    ru: {
      views: {
        tam: 'Вид спереди (3D)',
        perspektif: 'Перспектива 3/4',
        kutu: 'Упаковка и VIP',
        makro: 'Макро байонета'
      },
      zoomIn: 'Приблизить',
      zoomOut: 'Отдалить',
      perspectiveBadge: function (name) { return 'NARION ' + name + ' · ДИНАМИЧЕСКАЯ ПЕРСПЕКТИВА 3/4'; },
      boxBadgeNomad: 'NARION NOMAD · ТАКТИЧЕСКИЙ КЕЙС ДЛЯ ПУТЕШЕСТВИЙ',
      boxBadgeDefault: 'NARION · ЖЁСТКИЙ VIP-КЕЙС И РАСПАКОВКА',
      macroBadge: 'NARION · CNC БАЙОНЕТНЫЙ ЗАМОК И ОРЕХОВАЯ ОТДЕЛКА',
      woodNoteActive: 'Панель из массива твердых пород камерной сушки; специальная пропитка от влаги и тепла.',
      woodNoteDisabledDefault: 'В этой модели деревянная панель не предусмотрена.',
      noWoodSummary: 'Монолитный корпус (без дерева)',
      finishes: {
        firca: { name: 'Шлифованная нержавеющая сталь', spec: 'AISI 304 / 316L Satin' },
        sampanya: { name: 'PVD Шампань', spec: 'Роскошная латунь и золото PVD' },
        siyah: { name: 'Матовый черный PVD', spec: 'Обсидиановое титановое покрытие' },
        gun: { name: 'Gun Metal', spec: 'Темный графитовый металлик' }
      },
      woods: {
        ceviz: { name: 'Натуральный американский орех', spec: 'Глубокая текстура дерева' },
        mese: { name: 'Темный мореный дуб', spec: 'Матовая текстура мореного дуба' },
        disbudak: { name: 'Черный ясень', spec: 'Черные древесные волокна' }
      },
      models: {
        'narion-koza': { code: 'NARION KOZA · ВЕДУЩАЯ СЕРИЯ', taban: 'Ø150 мм (широкое устойчивое основание)', malzeme: 'Нержавеющая сталь AISI 304 и массив ореха' },
        'narion-ladin': { code: 'NARION LADİN · ВЕДУЩАЯ СЕРИЯ', taban: 'Ø160 мм', malzeme: 'Нержавеющая сталь AISI 304 и дерево «елочка»' },
        'narion-manolya': { code: 'NARION MANOLYA · ВЕДУЩАЯ СЕРИЯ', taban: 'Ø155 мм', malzeme: 'Сталь AISI 304 / 316L и деревянное кольцо' },
        'narion-servi': { code: 'NARION SERVİ · КЛАССИКА И ПРЕСТИЖ', taban: 'Ø170 мм', malzeme: 'Точеный массив дерева и сталь' },
        'narion-prizma': { code: 'NARION PRİZMA · СЕРИЯ ТЕХНОЛОГИЙ', taban: 'Ø150 мм (шестигранное основание)', malzeme: 'AISI 304 / Анодированный титан', woodNote: 'PRİZMA — монолитный геометрический металлический корпус (без дерева).' },
        'narion-nomad': { code: 'NARION NOMAD · СЕРИЯ ТЕХНОЛОГИЙ', taban: 'Ø140 мм (низкий центр тяжести)', malzeme: 'Облегченный металл и защитный чехол', woodNote: 'NOMAD — дорожная серия из цельного облегченного сплава (без дерева).' },
        'narion-aura': { code: 'NARION AURA · КЛАССИКА И ПРЕСТИЖ', taban: 'Ø160 мм', malzeme: 'PVD-латунные ребра и сердцевина из ореха' },
        'narion-monolit': { code: 'NARION MONOLİT · КЛАССИКА И ПРЕСТИЖ', taban: 'Ø165 мм (тяжелое мраморное основание)', malzeme: 'Колонна из массива дерева и основание из латуни/мрамора' },
        'narion-inci': { code: 'NARION İNCİ · КЛАССИКА И ПРЕСТИЖ', taban: 'Ø150 мм', malzeme: 'Обожженная техническая керамика и латунь', woodNote: 'İNCİ имеет корпус из обожженной технической керамики (без дерева).' },
        'narion-cakil': { code: 'NARION ÇAKIL · СОВРЕМЕННАЯ СЕРИЯ', taban: 'Ø165 мм (низкий профиль)', malzeme: 'Монолитный минерально-металлический корпус / Gun Metal', woodNote: 'ÇAKIL вдохновлен речной галькой — цельный корпус (без дерева).' }
      }
    }
  };

  var curI18n = I18N[lang] || I18N.tr;

  var stage = document.getElementById('sahne');
  if (!stage) return;

  // Build HBOT Studio Stage Elements
  var hmdCallout = stage.querySelector('.stage-hmd'); // Smart HMD rozeti (HTML'de, dile göre) korunur
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
  badge.textContent = 'NARION KOZA · ' + (curI18n.finishes.firca.name).toUpperCase();
  stage.appendChild(badge);

  var viewToggle = document.createElement('div');
  viewToggle.className = 'stage-view-toggle';
  viewToggle.innerHTML = '<button type="button" class="stage-v-btn is-active" data-view="tam">' + curI18n.views.tam + '</button>' +
                          '<button type="button" class="stage-v-btn" data-view="perspektif">' + curI18n.views.perspektif + '</button>' +
                          '<button type="button" class="stage-v-btn" data-view="kutu">' + curI18n.views.kutu + '</button>' +
                          '<button type="button" class="stage-v-btn" data-view="makro">' + curI18n.views.makro + '</button>';
  stage.appendChild(viewToggle);

  var zoomControls = document.createElement('div');
  zoomControls.className = 'stage-zoom-controls';
  zoomControls.innerHTML = '<button type="button" class="stage-z-btn" id="z-in" title="' + curI18n.zoomIn + '">+</button>' +
                           '<button type="button" class="stage-z-btn" id="z-out" title="' + curI18n.zoomOut + '">&minus;</button>';
  stage.appendChild(zoomControls);
  if (hmdCallout) stage.appendChild(hmdCallout);

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
  // View Modes (Stüdyo Ön / 3/4 Perspektif / Kutulama / Makro)
  // -------------------------------------------------------------
  var currentViewMode = 'tam';

  function setView(viewMode) {
    currentViewMode = viewMode;
    var model = MODELLER[currentModelId] || MODELLER['narion-koza'];
    var elBadge = document.getElementById('stage-badge');

    targetScale = 1.0;
    tiltWrap.style.transformOrigin = '50% 50%';

    var incoming = activeSlot === 'a' ? imgB : imgA;
    var outgoing = activeSlot === 'a' ? imgA : imgB;

    function transitionTo(srcUrl, badgeText) {
      var loader = new Image();
      loader.onload = function () {
        incoming.src = srcUrl;
        incoming.classList.add('is-active');
        outgoing.classList.remove('is-active');
        activeSlot = activeSlot === 'a' ? 'b' : 'a';
        if (elBadge && badgeText) elBadge.textContent = badgeText;
      };
      loader.src = srcUrl;
    }

    if (viewMode === 'tam') {
      updateProductVisual();
    } else if (viewMode === 'perspektif') {
      transitionTo('../gorsel/koza-perspektif-aci.webp', curI18n.perspectiveBadge(model.name));
    } else if (viewMode === 'kutu') {
      var boxSrc = (currentModelId === 'narion-nomad') ? '../gorsel/nomad-travel-kutu.webp' : '../gorsel/kutu-luks-sunum-v2.webp';
      var boxText = (currentModelId === 'narion-nomad') ? curI18n.boxBadgeNomad : curI18n.boxBadgeDefault;
      transitionTo(boxSrc, boxText);
    } else if (viewMode === 'makro') {
      transitionTo('../gorsel/bayonet-iscilik-makro.webp', curI18n.macroBadge);
    }
  }

  function resetToTamView() {
    if (currentViewMode !== 'tam') {
      currentViewMode = 'tam';
      var vBtns = document.querySelectorAll('.stage-v-btn');
      vBtns.forEach(function (b) {
        if (b.getAttribute('data-view') === 'tam') b.classList.add('is-active');
        else b.classList.remove('is-active');
      });
    }
  }

  // -------------------------------------------------------------
  // Specification Summary Sheet
  // -------------------------------------------------------------
  function updateSummarySheet() {
    var model = MODELLER[currentModelId] || MODELLER['narion-koza'];
    var modelI18n = (curI18n.models && curI18n.models[currentModelId]) || {};
    var finish = (curI18n.finishes && curI18n.finishes[currentFinishId]) || FINISHES[currentFinishId] || FINISHES['firca'];
    var wood = (curI18n.woods && curI18n.woods[currentWoodId]) || WOODS[currentWoodId] || WOODS['ceviz'];

    var elBadge = document.getElementById('stage-badge');
    if (elBadge) {
      elBadge.textContent = 'NARION ' + model.name + ' · ' + finish.name.toUpperCase();
    }

    var elCode = document.getElementById('sum-code');
    if (elCode) elCode.textContent = modelI18n.code || model.code;

    var elTitle = document.getElementById('sum-title');
    if (elTitle) elTitle.textContent = model.name;

    var elKap = document.getElementById('sum-kaplama');
    if (elKap) elKap.textContent = finish.name;

    var elAhs = document.getElementById('sum-ahsap');
    if (elAhs) {
      elAhs.textContent = model.hasWood ? wood.name : (modelI18n.woodNote || model.woodNote || curI18n.noWoodSummary);
    }

    var elYuk = document.getElementById('sum-yuk');
    if (elYuk) elYuk.textContent = model.height;

    var elSise = document.getElementById('sum-sise');
    if (elSise) elSise.textContent = model.sise;

    var elTab = document.getElementById('sum-taban');
    if (elTab) elTab.textContent = modelI18n.taban || model.taban;

    var elMalz = document.getElementById('sum-malzeme');
    if (elMalz) elMalz.textContent = modelI18n.malzeme || model.malzeme;

    // Adapt Step 3 (Wood Section) dynamically according to model capability
    var woodSwatches = document.querySelectorAll('[data-ahsap]');
    var woodParent = woodSwatches.length > 0 ? woodSwatches[0].closest('.config-step-card') : null;
    var woodNote = woodParent ? woodParent.querySelector('.config-step-note') : null;
    var woodGrid = woodParent ? woodParent.querySelector('.config-swatch-grid') : null;

    if (woodParent) {
      if (!model.hasWood) {
        if (woodNote) {
          woodNote.innerHTML = '<span style="display:inline-block; padding:6px 12px; background:#fff4e6; color:#9c4c00; border-radius:6px; font-weight:600; font-size:13px; line-height:1.4;">' +
            'ℹ️ ' + (modelI18n.woodNote || model.woodNote || curI18n.woodNoteDisabledDefault) + '</span>';
        }
        if (woodGrid) {
          woodGrid.style.opacity = '0.30';
          woodGrid.style.pointerEvents = 'none';
          woodGrid.style.filter = 'grayscale(1)';
        }
      } else {
        if (woodNote) {
          woodNote.textContent = curI18n.woodNoteActive;
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
        resetToTamView();
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
        resetToTamView();
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
        resetToTamView();
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
