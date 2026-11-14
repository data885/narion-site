/**
 * NARION CONNECT — Mobile Companion Web App & BLE 5.0 / Local HTTP-WS Client
 * Hardware Contract: NRN-HMD-TF-002 (Rev R2.1) • Patent-Pending TR 2026/017041
 *
 * Implements:
 *  1. Bit-exact 20-byte Telemetry (v0x03) & 12-byte Command codec + keyed authTag + CRC-8 (0x07)
 *  2. Web Bluetooth GATT Client (Android / Desktop Chrome / Edge)
 *  3. Same-Origin iOS Safari Local HTTP/WS Flow (blocks HTTPS->ws:// Mixed Content & opens explicit modal guide)
 *  4. Conserved Closed-Loop Lumped-Thermal Digital Twin (explicitly badged as Simulator when unconnected)
 *  5. B2B Lounge Sommelier PIN Lock (PIN: 1453) & Dual-Sensor / Hardware Comparator Fault Diagnostics
 */
(function () {
  'use strict';

  // Progressive enhancement for `<input type="checkbox" switch>` (modern-web-guidance `switch`)
  if (typeof HTMLInputElement !== 'undefined' && !('switch' in HTMLInputElement.prototype)) {
    import('https://cdn.jsdelivr.net/npm/input-switch-polyfill@0.1.3/+esm').catch(function () {});
  }

  // -------------------------------------------------------------------------
  // 1. BLE UUIDs & Wire Constants (Matches include/narion_protocol.h Rev R2.1)
  // -------------------------------------------------------------------------
  var UUID_SERVICE_HMD      = '4e415249-4f4e-484d-4432-000000000001';
  var UUID_CHAR_TELEMETRY   = '4e415249-4f4e-484d-4432-000000000002';
  var UUID_CHAR_COMMAND     = '4e415249-4f4e-484d-4432-000000000003';
  var UUID_CHAR_ACK         = '4e415249-4f4e-484d-4432-000000000004';

  var MODE = { STANDBY: 0, SOFT: 1, MEDIUM: 2, HARD: 3, HERBAL: 4, CUSTOM: 5, SELF_CLEAN: 6 };
  var FLAG = {
    PREHEATING:   1 << 0,
    READY:        1 << 1,
    DRAW_BOOST:   1 << 2,
    MANUAL_BOOST: 1 << 3,
    AUTO_SLEEP:   1 << 4,
    AUTO_STEEP:   1 << 5,
    LOUNGE_LOCK:  1 << 6,
    FAULT:        1 << 7
  };
  var FAULT = {
    NONE: 0,
    IMU_TILT: 1,
    OVERTEMP: 2,
    SENSOR: 3,
    HOUSING: 4,
    LOW_BAT: 5,
    SCORCH: 6,
    SENSOR_DIV: 7,
    HW_COMP: 8,
    STARVATION: 9
  };
  var CMD = {
    SET_MODE:         0x01,
    SET_TARGET_TEMP:  0x02,
    SET_MANUAL_BOOST: 0x03,
    SET_AUTO_STEEP:   0x04,
    SET_LOUNGE_LOCK:  0x05,
    CLEAR_FAULT:      0x06,
    START_SELF_CLEAN: 0x07,
    POWER_STANDBY:    0x08,
    RFID_POD_SYNC:    0x09
  };

  // -------------------------------------------------------------------------
  // 2. Localization (TR / EN / AR / RU)
  // -------------------------------------------------------------------------
  var LANG = (document.documentElement.lang || 'tr').slice(0, 2).toLowerCase();
  var I18N = {
    tr: {
      connTwin: 'SİMÜLATÖR MODU (CİHAZ BAĞLI DEĞİL)',
      connBle: 'FİZİKSEL CİHAZ BAĞLI (BLE 5.0)',
      connWs: 'YEREL CİHAZ BAĞLI (HTTP/WS)',
      stStandby: 'BEKLEME MODU',
      stPreheat: 'SERAMİK ÖN ISITMA',
      stReady: 'PID HEDEF ISIDA KİLİTLİ',
      stDraw: 'SDP31 NEFES BOOST (+%15)',
      stSleep: 'EKO UYKU (185°C KORUMA)',
      stClean: '65°C ÖN-TEMİZLİK AKTİF',
      stFaultTilt: 'ACİL KESİCİ: >35° DEVRİLME!',
      stFaultScorch: 'KORUMA: DUTY-DROP KURU HAZNE!',
      stFaultSensorDiv: 'SENSÖR FARK HATASI (|PT1000-NTC|>15°C)',
      stFaultHwComp: '248°C DONANIM KOMPARATÖR KESİCİ!',
      stFaultBat: 'BATARYA DÜŞÜK: 5 SN HOT-SWAP YAPIN',
      targetFmt: 'Hedef: {t}°C • {m}',
      modes: ['Bekleme', 'Blonde (190°C)', 'Medium (215°C)', 'Dark (235°C)', 'Herbal (180°C)', 'Özel PID', 'Ön-Temizlik'],
      bleUnsupported: 'Bu tarayıcıda Web Bluetooth kapalı (ör. iPhone Safari). Fiziksel başlığa bağlanmak için açılan penceredeki 3 adımlı yerel Wi-Fi (http://192.168.4.1) yolunu izleyin.',
      wsMixedBlocked: 'HTTPS sayfasından yerel ws://192.168.4.1 adresine doğrudan soket açılması tarayıcı güvenlik kuralı (Mixed Content) gereği engellenir. Cihazın kendi Wi-Fi ağına bağlanıp http://192.168.4.1 yerel arayüzünü açın.',
      wsUnreachable: '192.168.4.1:81 üzerinde fiziksel NARION başlığına ulaşılamadı. Lütfen cihazda 3 sn basılı tutup Wi-Fi AP modunu açtığınızdan emin olun. (Şu an Simülatör Modundasınız.)',
      pinErr: 'Hatalı Sommelier PIN kodu! (Varsayılan Demo PIN: 1453)',
      lockBlocked: 'Garson Sommelier Kilidi aktif: Sıcaklık yalnızca izin verilen aralıkta (185–205°C) değiştirilebilir.',
      cleanTooHot: 'Ön-temizlik modu için haznenin 95°C altında olması gerekir.'
    },
    en: {
      connTwin: 'SIMULATOR MODE (NO DEVICE CONNECTED)',
      connBle: 'PHYSICAL HMD CONNECTED (BLE 5.0)',
      connWs: 'LOCAL HMD CONNECTED (HTTP/WS)',
      stStandby: 'STANDBY MODE',
      stPreheat: 'CERAMIC PRE-HEATING',
      stReady: 'PID LOCKED AT TARGET',
      stDraw: 'SDP31 DRAW BOOST (+15%)',
      stSleep: 'ECO AUTO-SLEEP (185°C)',
      stClean: '65°C WARM SELF-CLEAN',
      stFaultTilt: 'SAFETY CUTOFF: >35° TILT!',
      stFaultScorch: 'GUARD: DUTY-DROP DRY BOWL!',
      stFaultSensorDiv: 'DUAL-SENSOR DIVERGENCE (>15°C)',
      stFaultHwComp: '248°C HW COMPARATOR TRIP!',
      stFaultBat: 'LOW BATTERY: 5s HOT-SWAP NEEDED',
      targetFmt: 'Target: {t}°C • {m}',
      modes: ['Standby', 'Blonde (190°C)', 'Medium (215°C)', 'Dark (235°C)', 'Herbal (180°C)', 'Custom PID', 'Self-Clean'],
      bleUnsupported: 'Web Bluetooth is unavailable in this browser (e.g. iPhone Safari). Follow the 3-step local Wi-Fi guide (http://192.168.4.1) in the modal to connect to a physical head.',
      wsMixedBlocked: 'Browsers block ws://192.168.4.1 sockets from an HTTPS page (Mixed Content). Join the HMD Wi-Fi AP and open http://192.168.4.1 directly.',
      wsUnreachable: 'Could not reach a physical NARION head at 192.168.4.1:81. Hold the HMD button for 3s to enable WPA2 Wi-Fi AP mode. (Remaining in Simulator Mode.)',
      pinErr: 'Invalid Sommelier PIN! (Default Demo PIN: 1453)',
      lockBlocked: 'Sommelier Lock active: Guest adjustments are clamped to 185–205°C.',
      cleanTooHot: 'Bowl must cool below 95°C before starting 65°C Self-Clean.'
    },
    ar: {
      connTwin: 'وضع المحاكاة (لا يوجد جهاز متصل)',
      connBle: 'متصل فعلياً عبر بلوتوث BLE 5.0',
      connWs: 'متصل محلياً بالجهاز (HTTP/WS)',
      stStandby: 'وضع الاستعداد',
      stPreheat: 'تسخين سيراميك تمهيدي',
      stReady: 'ثبات حراري PID جاهز',
      stDraw: 'تعزيز السحب SDP31 (+15%)',
      stSleep: 'سكون ذكي (185°C)',
      stClean: 'تنظيف دافئ 65°C',
      stFaultTilt: 'فصل أمان فوري: ميلان >35°!',
      stFaultScorch: 'حماية: جفاف المعسل (انخفاض الحمل)',
      stFaultSensorDiv: 'خطأ تباين المستشعرين (>15°C)',
      stFaultHwComp: 'فصل مقارن الأمان المادي 248°C!',
      stFaultBat: 'بطارية منخفضة: تبديل خلال 5 ثوانٍ',
      targetFmt: 'الهدف: {t}°C • {m}',
      modes: ['استعداد', 'بلوند (190°C)', 'متوسط (215°C)', 'دارك (235°C)', 'أعشاب (180°C)', 'مخصص PID', 'تنظيف'],
      bleUnsupported: 'متصفحك لا يدعم Web Bluetooth (مثل Safari على iPhone). اتبع خطوات Wi-Fi المحلية (http://192.168.4.1) في النافذة المنبثقة.',
      wsMixedBlocked: 'يمنع المتصفح فتح اتصال ws:// محلي من صفحة HTTPS. اتصل بشبكة الجهاز وافتح http://192.168.4.1 مباشرة.',
      wsUnreachable: 'تعذر الوصول إلى جهاز فعلي على 192.168.4.1:81. (أنت الآن في وضع المحاكاة).',
      pinErr: 'رمز PIN غير صحيح! (الرمز الافتراضي: 1453)',
      lockBlocked: 'قفل الساقي مفعل: يُسمح بضبط الحرارة بين 185–205°C فقط.',
      cleanTooHot: 'يجب أن تنخفض حرارة الحجرة دون 95°C قبل التنظيف.'
    },
    ru: {
      connTwin: 'РЕЖИМ СИМУЛЯТОРА (БЕЗ УСТРОЙСТВА)',
      connBle: 'УСТРОЙСТВО ПОДКЛЮЧЕНО (BLE 5.0)',
      connWs: 'ЛОКАЛЬНОЕ ПОДКЛЮЧЕНИЕ (HTTP/WS)',
      stStandby: 'РЕЖИМ ОЖИДАНИЯ',
      stPreheat: 'ПРОГРЕВ КЕРАМИКИ',
      stReady: 'PID СТАБИЛИЗИРОВАН',
      stDraw: 'SDP31 ТЯГА BOOST (+15%)',
      stSleep: 'ЭКО-СОН (185°C)',
      stClean: '65°C МЯГКАЯ ОЧИСТКА',
      stFaultTilt: 'АВАРИЙНЫЙ СТОП: НАКЛОН >35°!',
      stFaultScorch: 'ЗАЩИТА: СУХАЯ ЧАША (DUTY-DROP)',
      stFaultSensorDiv: 'РАСХОЖДЕНИЕ ДАТЧИКОВ (>15°C)',
      stFaultHwComp: 'АППАРАТНАЯ ОТСЕЧКА 248°C!',
      stFaultBat: 'НИЗКИЙ ЗАРЯД: HOT-SWAP 5 СЕК',
      targetFmt: 'Цель: {t}°C • {m}',
      modes: ['Ожидание', 'Blonde (190°C)', 'Medium (215°C)', 'Dark (235°C)', 'Herbal (180°C)', 'Свой PID', 'Очистка'],
      bleUnsupported: 'Web Bluetooth недоступен в этом браузере (например, iOS Safari). Следуйте инструкции в окне для входа на http://192.168.4.1.',
      wsMixedBlocked: 'Браузер блокирует ws://192.168.4.1 со страницы HTTPS (Mixed Content). Подключитесь к Wi-Fi чаши и откройте http://192.168.4.1.',
      wsUnreachable: 'Устройство на 192.168.4.1:81 не найдено. Удерживайте кнопку чаши 3 сек для включения Wi-Fi AP. (Активен режим симулятора.)',
      pinErr: 'Неверный PIN сомелье! (Демо PIN: 1453)',
      lockBlocked: 'Активна блокировка кальянщика: гостю доступен диапазон 185–205°C.',
      cleanTooHot: 'Для очистки чаша должна остыть ниже 95°C.'
    }
  };
  var T = I18N[LANG] || I18N.tr;

  // -------------------------------------------------------------------------
  // 3. CRC-8-CCITT (Poly 0x07), Session Auth Tag & Binary Wire Codec
  // -------------------------------------------------------------------------
  function crc8(bytes, len, init) {
    var crc = (init === undefined) ? 0x00 : (init & 0xFF);
    for (var i = 0; i < len; i++) {
      crc ^= bytes[i];
      for (var b = 0; b < 8; b++) {
        crc = (crc & 0x80) ? (((crc << 1) ^ 0x07) & 0xFF) : ((crc << 1) & 0xFF);
      }
    }
    return crc;
  }

  function computeAuthTag(cmdBytes10, sessionKey) {
    if (!sessionKey) return 0x00;
    var keyBytes = new Uint8Array([sessionKey & 0xFF, (sessionKey >> 8) & 0xFF]);
    var c = crc8(keyBytes, 2, 0xA5);
    c = crc8(cmdBytes10, 10, c);
    return crc8(keyBytes, 2, c);
  }

  var seqCounter = 1;
  function encodeCommand(opcode, param1, param2, pinCode) {
    var buf = new ArrayBuffer(12);
    var dv = new DataView(buf);
    var u8 = new Uint8Array(buf);
    dv.setUint8(0, 0x43); // 'C'
    dv.setUint8(1, opcode & 0xFF);
    dv.setUint16(2, (seqCounter++) & 0xFFFF, true);
    dv.setUint16(4, (param1 || 0) & 0xFFFF, true);
    dv.setUint16(6, (param2 || 0) & 0xFFFF, true);
    dv.setUint16(8, (pinCode || 0) & 0xFFFF, true);
    var sessionKey = Number(window.__NARION_SESSION_KEY || 0) & 0xFFFF;
    dv.setUint8(10, computeAuthTag(u8, sessionKey));
    dv.setUint8(11, crc8(u8, 11, 0x00));
    return u8;
  }

  function encodeTelemetry(state) {
    var buf = new ArrayBuffer(20);
    var dv = new DataView(buf);
    var u8 = new Uint8Array(buf);
    dv.setUint8(0, 0x4E); // 'N'
    dv.setUint8(1, 0x03); // Rev R2.1 (0x03)
    dv.setUint16(2, Math.max(0, Math.round(state.actualC * 10)), true);
    dv.setUint16(4, Math.max(0, Math.round(state.targetC * 10)), true);
    dv.setUint16(6, Math.round(state.packMv), true);
    dv.setInt16(8, Math.round(state.drawPa), true);
    dv.setUint8(10, Math.max(0, Math.min(100, Math.round(state.batteryPct))));
    dv.setUint8(11, Math.max(0, Math.min(100, Math.round(state.pwmDutyPct))));
    dv.setUint8(12, state.modeId & 0xFF);
    dv.setUint8(13, state.flags & 0xFF);
    dv.setUint8(14, state.faultCode & 0xFF);
    dv.setUint16(15, state.puffCount & 0xFFFF, true);
    dv.setUint16(17, Math.max(0, Math.round(state.remainSec)), true);
    dv.setUint8(19, crc8(u8, 19, 0x00));
    return u8;
  }

  function decodeTelemetry(u8) {
    if (!u8 || u8.byteLength !== 20) return null;
    if (u8[0] !== 0x4E || crc8(u8, 19, 0x00) !== u8[19]) return null;
    var dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    return {
      version:    dv.getUint8(1),
      actualC:    dv.getUint16(2, true) / 10,
      targetC:    dv.getUint16(4, true) / 10,
      packMv:     dv.getUint16(6, true),
      drawPa:     dv.getInt16(8, true),
      batteryPct: dv.getUint8(10),
      pwmDutyPct: dv.getUint8(11),
      modeId:     dv.getUint8(12),
      flags:      dv.getUint8(13),
      faultCode:  dv.getUint8(14),
      puffCount:  dv.getUint16(15, true),
      remainSec:  dv.getUint16(17, true),
      rawBytes:   u8
    };
  }

  function bytesToHex(u8) {
    var out = [];
    for (var i = 0; i < u8.length; i++) {
      out.push(u8[i].toString(16).toUpperCase().padStart(2, '0'));
    }
    return out.join(' ');
  }

  // -------------------------------------------------------------------------
  // 4. Transport State & Conserved Closed-Loop Digital Twin Engine
  // -------------------------------------------------------------------------
  var transport = 'twin'; // 'twin' | 'ble' | 'ws'
  var bleDevice = null;
  var bleCmdChar = null;
  var wsConn = null;
  var lastCmdHex = '43 01 01 00 02 00 00 00 00 00 00 --';

  var twin = {
    actualC: 213.8,
    baseTargetC: 215.0,
    targetC: 215.0,
    packMv: 16120,
    drawPa: 0,
    batteryPct: 91,
    pwmDutyPct: 35,
    modeId: MODE.MEDIUM,
    flags: FLAG.READY | FLAG.AUTO_STEEP,
    faultCode: FAULT.NONE,
    puffCount: 14,
    remainSec: 5460,
    autoSteep: true,
    manualBoost: false,
    manualBoostUntil: 0,
    autoSleep: false,
    loungeLock: false,
    lockMinC: 185,
    lockMaxC: 205,
    sommelierPin: 1453,
    simInhaling: false,
    inhaleStartedAt: 0,
    syrupGrams: 13.4,
    integral: 4.5
  };

  var chartHistory = [];
  for (var h = 0; h < 48; h++) {
    chartHistory.push({ actual: 213.5 + Math.sin(h / 5) * 0.8, target: 215 });
  }

  function showToast(msg) {
    var el = document.getElementById('nc-toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { el.hidden = true; }, 5200);
  }

  function openIosGuideModal() {
    var iosDialog = document.getElementById('nc-ios-dialog');
    if (iosDialog && typeof iosDialog.showModal === 'function') {
      if (!iosDialog.open) iosDialog.showModal();
    } else {
      showToast(T.wsMixedBlocked);
    }
  }

  // Send command over active transport (BLE -> WS -> Digital Twin)
  function sendCommand(opcode, p1, p2, pin) {
    var pkt = encodeCommand(opcode, p1, p2, pin);
    lastCmdHex = bytesToHex(pkt);

    if (transport === 'ble' && bleCmdChar) {
      bleCmdChar.writeValue(pkt).catch(function (err) {
        showToast('BLE Write Error: ' + err.message);
      });
      return;
    }
    if (transport === 'ws' && wsConn && wsConn.readyState === 1) {
      wsConn.send(pkt);
      return;
    }
    applyCommandToTwin(pkt);
  }

  function applyCommandToTwin(pkt) {
    var dv = new DataView(pkt.buffer, pkt.byteOffset, pkt.byteLength);
    var opcode = dv.getUint8(1);
    var p1 = dv.getUint16(4, true);
    var p2 = dv.getUint16(6, true);
    var pin = dv.getUint16(8, true);

    if (opcode === CMD.SET_LOUNGE_LOCK) {
      if (pin !== twin.sommelierPin) {
        showToast(T.pinErr);
        syncSwitches();
        return;
      }
      twin.loungeLock = (p1 !== 0);
      if (twin.loungeLock && p2 > 0) {
        twin.lockMinC = (p2 >> 8) & 0xFF;
        twin.lockMaxC = p2 & 0xFF;
        if (twin.baseTargetC < twin.lockMinC) twin.baseTargetC = twin.lockMinC;
        if (twin.baseTargetC > twin.lockMaxC) twin.baseTargetC = twin.lockMaxC;
      }
      return;
    }

    if (opcode === CMD.CLEAR_FAULT) {
      twin.faultCode = FAULT.NONE;
      twin.syrupGrams = 13.4;
      return;
    }

    if (twin.faultCode !== FAULT.NONE) return;

    if (opcode === CMD.POWER_STANDBY) {
      if (twin.loungeLock && pin !== twin.sommelierPin) { showToast(T.lockBlocked); return; }
      twin.modeId = MODE.STANDBY;
      twin.manualBoost = false;
      return;
    }

    if (opcode === CMD.SET_MODE) {
      var modeTemps = { 1: 190, 2: 215, 3: 235, 4: 180 };
      var nextT = modeTemps[p1] || twin.baseTargetC;
      if (twin.loungeLock && pin !== twin.sommelierPin && (nextT < twin.lockMinC || nextT > twin.lockMaxC)) {
        showToast(T.lockBlocked);
        return;
      }
      twin.modeId = p1;
      twin.baseTargetC = nextT;
      twin.manualBoost = false;
      twin.autoSleep = false;
    } else if (opcode === CMD.SET_TARGET_TEMP) {
      var reqC = p1 / 10;
      if (twin.loungeLock && pin !== twin.sommelierPin && (reqC < twin.lockMinC || reqC > twin.lockMaxC)) {
        showToast(T.lockBlocked);
        syncSliderToTarget(twin.baseTargetC);
        return;
      }
      twin.modeId = MODE.CUSTOM;
      twin.baseTargetC = Math.max(150, Math.min(240, reqC));
      twin.autoSleep = false;
    } else if (opcode === CMD.SET_MANUAL_BOOST) {
      if (twin.loungeLock && pin !== twin.sommelierPin && (twin.baseTargetC + 15 > twin.lockMaxC)) {
        showToast(T.lockBlocked);
        return;
      }
      twin.manualBoost = (p1 !== 0);
      twin.manualBoostUntil = Date.now() + 90000;
    } else if (opcode === CMD.SET_AUTO_STEEP) {
      twin.autoSteep = (p1 !== 0);
    } else if (opcode === CMD.START_SELF_CLEAN) {
      if (twin.actualC > 95) {
        showToast(T.cleanTooHot);
        twin.actualC = 58.0;
      }
      twin.modeId = MODE.SELF_CLEAN;
      twin.baseTargetC = 65;
    }
  }

  function stepDigitalTwin() {
    if (transport !== 'twin') return;

    var dt = 0.25; // 4 Hz tick
    if (twin.manualBoost && Date.now() > twin.manualBoostUntil) {
      twin.manualBoost = false;
    }

    if (twin.simInhaling) {
      twin.drawPa = -48 - Math.round(Math.random() * 8);
      twin.autoSleep = false;
    } else {
      twin.drawPa = 0;
    }

    var effTarget = 0;
    if (twin.faultCode === FAULT.NONE && twin.modeId !== MODE.STANDBY) {
      if (twin.modeId === MODE.SELF_CLEAN) {
        effTarget = 65;
      } else if (twin.autoSleep) {
        effTarget = Math.min(twin.baseTargetC, 185);
      } else {
        effTarget = twin.baseTargetC + (twin.manualBoost ? 15 : 0);
        if (effTarget > 240) effTarget = 240;
      }
    }
    twin.targetC = effTarget;

    // Conserved Closed-Loop Thermal Model (C_heater = 112 J/K -> max dT/dt <= 1.18 °C/s @ 132W)
    if (twin.faultCode !== FAULT.NONE || twin.modeId === MODE.STANDBY) {
      twin.pwmDutyPct = 0;
      var pPassiveLoss = (twin.actualC - 24.5) * 0.19;
      twin.actualC -= (pPassiveLoss / 112.0) * dt;
    } else {
      var wetFrac = Math.max(0, Math.min(1, twin.syrupGrams / 14.0));
      var err = effTarget - twin.actualC;
      twin.integral = Math.max(-15, Math.min(35, twin.integral + err * 0.16 * dt));
      var ff = (effTarget - 24.5) * (0.14 + 0.05 * wetFrac) + (twin.simInhaling ? 15 : 0);
      var duty = Math.max(0, Math.min(100, ff + 5.0 * err + twin.integral));
      twin.pwmDutyPct = Math.round(duty);

      var pIn = (duty / 100) * 132.0;
      var pHousing = (twin.actualC - 24.5) * 0.19;
      var pWetCond = wetFrac * Math.max(0, twin.actualC - 105.0) * 0.095;
      var pPuffConv = twin.simInhaling ? (11.5 + 8.5 * wetFrac) : 0;
      twin.actualC += ((pIn - pHousing - pWetCond - pPuffConv) / 112.0) * dt;
    }

    var flags = 0;
    if (twin.faultCode !== FAULT.NONE) {
      flags |= FLAG.FAULT;
    } else if (twin.modeId !== MODE.STANDBY) {
      if (Math.abs(twin.actualC - effTarget) <= 2.0) flags |= FLAG.READY;
      else flags |= FLAG.PREHEATING;
    }
    if (twin.simInhaling && twin.faultCode === FAULT.NONE && twin.modeId !== MODE.STANDBY) flags |= FLAG.DRAW_BOOST;
    if (twin.manualBoost) flags |= FLAG.MANUAL_BOOST;
    if (twin.autoSleep) flags |= FLAG.AUTO_SLEEP;
    if (twin.autoSteep) flags |= FLAG.AUTO_STEEP;
    if (twin.loungeLock) flags |= FLAG.LOUNGE_LOCK;
    twin.flags = flags;

    twin.remainSec = Math.max(60, twin.remainSec - (twin.pwmDutyPct > 0 ? 0.25 : 0.02));
    twin.batteryPct = Math.max(5, Math.min(100, Math.round((twin.remainSec / 6000) * 100)));
    twin.packMv = 12500 + twin.batteryPct * 42 - twin.pwmDutyPct * 2.5;

    // Encode -> Decode through real 20-byte wire format + CRC-8!
    var wireFrame = encodeTelemetry(twin);
    var parsed = decodeTelemetry(wireFrame);
    if (parsed) renderTelemetry(parsed);
  }

  // -------------------------------------------------------------------------
  // 5. Real Web Bluetooth & Same-Origin Local HTTP/WS Connection Handlers
  // -------------------------------------------------------------------------
  async function connectWebBluetooth() {
    if (!navigator.bluetooth) {
      showToast(T.bleUnsupported);
      openIosGuideModal();
      return;
    }
    try {
      var device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'NARION' }, { services: [UUID_SERVICE_HMD] }],
        optionalServices: [UUID_SERVICE_HMD]
      });
      bleDevice = device;
      device.addEventListener('gattserverdisconnected', function () {
        transport = 'twin';
        bleCmdChar = null;
        updateTransportBadge();
      });

      var server = await device.gatt.connect();
      var service = await server.getPrimaryService(UUID_SERVICE_HMD);
      var telChar = await service.getCharacteristic(UUID_CHAR_TELEMETRY);
      bleCmdChar = await service.getCharacteristic(UUID_CHAR_COMMAND);

      await telChar.startNotifications();
      telChar.addEventListener('characteristicvaluechanged', function (ev) {
        var val = ev.target.value;
        var u8 = new Uint8Array(val.buffer, val.byteOffset, val.byteLength);
        var parsed = decodeTelemetry(u8);
        if (parsed) renderTelemetry(parsed);
      });

      try {
        var ackChar = await service.getCharacteristic(UUID_CHAR_ACK);
        await ackChar.startNotifications();
        ackChar.addEventListener('characteristicvaluechanged', function (ev) {
          var dv = ev.target.value;
          if (dv.byteLength === 8 && dv.getUint8(4) === 0x03) {
            showToast(T.lockBlocked);
          }
        });
      } catch (_) {}

      transport = 'ble';
      updateTransportBadge(device.name || 'NARION-HMD');
    } catch (err) {
      if (err && err.name !== 'NotFoundError') {
        showToast('Bluetooth: ' + err.message);
      }
    }
  }

  function connectLocalWebSocket() {
    // CRITICAL FIX: Never initiate `ws://192.168.4.1:81` from an `https:` origin!
    // Browsers block HTTPS -> ws:// under Mixed Content rules, and silently falling back
    // to Simulator Mode would deceive users into thinking they control a physical heater.
    if (location.protocol === 'https:') {
      openIosGuideModal();
      return;
    }

    try {
      var host = (location.hostname && (location.hostname.indexOf('192.168.') === 0 || location.hostname.indexOf('10.') === 0))
        ? location.hostname
        : '192.168.4.1';
      var ws = new WebSocket('ws://' + host + ':81');
      ws.binaryType = 'arraybuffer';
      var opened = false;
      var timer = setTimeout(function () {
        if (!opened) {
          try { ws.close(); } catch (_) {}
          showToast(T.wsUnreachable);
        }
      }, 2400);

      ws.onopen = function () {
        opened = true;
        clearTimeout(timer);
        wsConn = ws;
        transport = 'ws';
        updateTransportBadge(host);
      };
      ws.onmessage = function (ev) {
        if (ev.data instanceof ArrayBuffer && ev.data.byteLength === 20) {
          var parsed = decodeTelemetry(new Uint8Array(ev.data));
          if (parsed) renderTelemetry(parsed);
        }
      };
      ws.onclose = function () {
        if (transport === 'ws') {
          transport = 'twin';
          wsConn = null;
          updateTransportBadge();
          showToast(T.wsUnreachable);
        }
      };
      ws.onerror = function () {
        clearTimeout(timer);
        if (!opened) {
          showToast(T.wsUnreachable);
        }
      };
    } catch (_) {
      showToast(T.wsUnreachable);
    }
  }

  // -------------------------------------------------------------------------
  // 6. UI Rendering & Slider / Switch / Dialog Sync
  // -------------------------------------------------------------------------
  function syncSliderCssVars(slider) {
    if (!slider) return;
    slider.style.setProperty('--attr-min', slider.min || 150);
    slider.style.setProperty('--attr-max', slider.max || 240);
    slider.style.setProperty('--control-value', slider.value);
    var modeLabel = T.modes[twin.modeId] || '';
    slider.setAttribute('aria-valuetext', slider.value + '°C — ' + modeLabel);
  }

  function syncSliderToTarget(degC) {
    var slider = document.getElementById('nc-temp-slider');
    var valLbl = document.getElementById('nc-slider-val');
    if (!slider) return;
    var rounded = Math.round(degC);
    if (document.activeElement !== slider) {
      slider.value = String(rounded);
      syncSliderCssVars(slider);
    }
    if (valLbl) valLbl.textContent = rounded + '°C';
  }

  function syncSwitches() {
    var swSteep = document.getElementById('nc-sw-steep');
    var swLock = document.getElementById('nc-sw-lock');
    if (swSteep) swSteep.checked = !!twin.autoSteep;
    if (swLock) swLock.checked = !!twin.loungeLock;
  }

  function updateTransportBadge(devName) {
    var pill = document.getElementById('nc-conn-pill');
    var txt = document.getElementById('nc-conn-text');
    var simRibbon = document.getElementById('nc-sim-ribbon');
    if (pill && txt) {
      if (transport === 'ble') {
        pill.setAttribute('data-conn', 'ble');
        txt.textContent = T.connBle + (devName ? ' • ' + devName : '');
      } else if (transport === 'ws') {
        pill.setAttribute('data-conn', 'ws');
        txt.textContent = T.connWs + (devName ? ' • ' + devName : '');
      } else {
        pill.setAttribute('data-conn', 'twin');
        txt.textContent = T.connTwin;
      }
    }
    if (simRibbon) {
      simRibbon.hidden = (transport !== 'twin');
    }
  }

  function renderTelemetry(f) {
    var ring = document.getElementById('nc-halo-ring');
    var elState = document.getElementById('nc-halo-state');
    var elActual = document.getElementById('nc-temp-actual');
    var elTarget = document.getElementById('nc-temp-target');

    var haloColor = '#2fd47a';
    var stateLabel = T.stReady;

    if (f.flags & FLAG.FAULT) {
      haloColor = '#ef4444';
      if (f.faultCode === FAULT.IMU_TILT) stateLabel = T.stFaultTilt;
      else if (f.faultCode === FAULT.SCORCH) stateLabel = T.stFaultScorch;
      else if (f.faultCode === FAULT.SENSOR_DIV) stateLabel = T.stFaultSensorDiv;
      else if (f.faultCode === FAULT.HW_COMP) stateLabel = T.stFaultHwComp;
      else stateLabel = T.stFaultBat;
    } else if (f.modeId === MODE.STANDBY) {
      haloColor = '#94a3b8';
      stateLabel = T.stStandby;
    } else if (f.modeId === MODE.SELF_CLEAN) {
      haloColor = '#38bdf8';
      stateLabel = T.stClean;
    } else if (f.flags & FLAG.DRAW_BOOST) {
      haloColor = '#38bdf8';
      stateLabel = T.stDraw;
    } else if (f.flags & FLAG.AUTO_SLEEP) {
      haloColor = '#f59e0b';
      stateLabel = T.stSleep;
    } else if (f.flags & FLAG.PREHEATING) {
      haloColor = '#f59e0b';
      stateLabel = T.stPreheat;
    }

    var pct = Math.max(8, Math.min(98, Math.round(((f.actualC - 25) / (240 - 25)) * 100)));
    if (ring) {
      ring.style.setProperty('--halo-color', haloColor);
      ring.style.setProperty('--dial-pct', pct + '%');
    }
    if (elState) elState.textContent = stateLabel;
    if (elActual) elActual.textContent = f.actualC.toFixed(1) + '°';
    if (elTarget) {
      var mName = T.modes[f.modeId] || 'PID';
      elTarget.textContent = T.targetFmt.replace('{t}', Math.round(f.targetC)).replace('{m}', mName);
    }

    setText('nc-m-bat', '%' + f.batteryPct);
    setText('nc-m-rem', Math.round(f.remainSec / 60) + ' dk');
    setText('nc-m-pwm', '%' + f.pwmDutyPct);
    setText('nc-m-draw', f.drawPa + ' Pa');
    setText('nc-m-puff', String(f.puffCount));
    setText('nc-m-volt', (f.packMv / 1000).toFixed(2) + 'V');

    var presetBtns = document.querySelectorAll('.nc-preset-btn[data-mode]');
    presetBtns.forEach(function (btn) {
      var m = Number(btn.getAttribute('data-mode'));
      btn.setAttribute('aria-pressed', m === f.modeId ? 'true' : 'false');
    });

    var boostBtn = document.getElementById('nc-btn-boost');
    if (boostBtn) {
      boostBtn.classList.toggle('on', Boolean(f.flags & FLAG.MANUAL_BOOST));
    }

    var lockBanner = document.getElementById('nc-lock-banner');
    if (lockBanner) {
      lockBanner.hidden = !(f.flags & FLAG.LOUNGE_LOCK);
    }

    var faultBanner = document.getElementById('nc-fault-banner');
    if (faultBanner) {
      faultBanner.hidden = !(f.flags & FLAG.FAULT);
    }

    if (f.targetC >= 150) syncSliderToTarget(f.targetC - ((f.flags & FLAG.MANUAL_BOOST) ? 15 : 0));

    chartHistory.push({ actual: f.actualC, target: f.targetC || 25 });
    if (chartHistory.length > 48) chartHistory.shift();
    renderSvgCurve();

    var hexEl = document.getElementById('nc-wire-hex');
    if (hexEl && f.rawBytes) {
      hexEl.textContent =
        'MODE         : ' + (transport === 'twin' ? 'SIMULATOR (NO HW)' : transport.toUpperCase()) + '\n' +
        'TX CMD (12B) : ' + lastCmdHex + '\n' +
        'RX TEL (20B) : ' + bytesToHex(f.rawBytes) + '  [v0x0' + f.version + ' • CRC-8 OK: 0x' + f.rawBytes[19].toString(16).toUpperCase().padStart(2, '0') + ']\n' +
        'DECODED      : T_act=' + f.actualC.toFixed(1) + '°C | T_set=' + f.targetC.toFixed(1) + '°C | Duty=' + f.pwmDutyPct + '% | SDP31=' + f.drawPa + 'Pa | Vpack=' + (f.packMv / 1000).toFixed(2) + 'V';
    }
  }

  function renderSvgCurve() {
    var polyAct = document.getElementById('nc-svg-actual');
    var polySet = document.getElementById('nc-svg-target');
    if (!polyAct || !polySet || chartHistory.length < 2) return;

    var w = 480, h = 140;
    var ptsAct = [], ptsSet = [];
    for (var i = 0; i < chartHistory.length; i++) {
      var x = (i / (chartHistory.length - 1)) * w;
      var yAct = h - ((Math.max(20, Math.min(255, chartHistory[i].actual)) - 20) / 235) * (h - 16) - 8;
      var ySet = h - ((Math.max(20, Math.min(255, chartHistory[i].target)) - 20) / 235) * (h - 16) - 8;
      ptsAct.push(x.toFixed(1) + ',' + yAct.toFixed(1));
      ptsSet.push(x.toFixed(1) + ',' + ySet.toFixed(1));
    }
    polyAct.setAttribute('points', ptsAct.join(' '));
    polySet.setAttribute('points', ptsSet.join(' '));
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // -------------------------------------------------------------------------
  // 7. Event Wiring & Accessible Dialog Light-Dismiss Fallback
  // -------------------------------------------------------------------------
  function initApp() {
    var slider = document.getElementById('nc-temp-slider');
    if (slider) {
      syncSliderCssVars(slider);
      slider.addEventListener('input', function () {
        syncSliderCssVars(slider);
        setText('nc-slider-val', slider.value + '°C');
      });
      slider.addEventListener('change', function () {
        sendCommand(CMD.SET_TARGET_TEMP, Math.round(Number(slider.value) * 10), 0, 0);
      });
    }

    var btnMinus = document.getElementById('nc-step-minus');
    var btnPlus = document.getElementById('nc-step-plus');
    if (btnMinus && slider) {
      btnMinus.addEventListener('click', function () {
        var v = Math.max(150, Number(slider.value) - 1);
        slider.value = String(v);
        syncSliderCssVars(slider);
        setText('nc-slider-val', v + '°C');
        sendCommand(CMD.SET_TARGET_TEMP, v * 10, 0, 0);
      });
    }
    if (btnPlus && slider) {
      btnPlus.addEventListener('click', function () {
        var v = Math.min(240, Number(slider.value) + 1);
        slider.value = String(v);
        syncSliderCssVars(slider);
        setText('nc-slider-val', v + '°C');
        sendCommand(CMD.SET_TARGET_TEMP, v * 10, 0, 0);
      });
    }

    document.querySelectorAll('.nc-preset-btn[data-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        sendCommand(CMD.SET_MODE, Number(btn.getAttribute('data-mode')), 0, 0);
      });
    });

    onClick('nc-btn-ble', connectWebBluetooth);
    onClick('nc-btn-ws', connectLocalWebSocket);
    onClick('nc-btn-ios-guide', openIosGuideModal);
    onClick('nc-btn-boost', function () {
      var next = !(twin.manualBoost);
      sendCommand(CMD.SET_MANUAL_BOOST, next ? 1 : 0, 0, 0);
    });
    onClick('nc-btn-standby', function () {
      if (twin.modeId === MODE.STANDBY) sendCommand(CMD.SET_MODE, MODE.MEDIUM, 0, 0);
      else sendCommand(CMD.POWER_STANDBY, 0, 0, 0);
    });
    onClick('nc-btn-clean', function () {
      sendCommand(CMD.START_SELF_CLEAN, 0, 0, 0);
    });
    onClick('nc-btn-clear-fault', function () {
      sendCommand(CMD.CLEAR_FAULT, 0, 0, 0);
    });

    // Interactive Hardware Testbench buttons
    var puffBtn = document.getElementById('nc-sim-puff');
    if (puffBtn) {
      var startPuff = function (e) {
        e.preventDefault();
        if (!twin.simInhaling) {
          twin.simInhaling = true;
          twin.inhaleStartedAt = Date.now();
        }
      };
      var endPuff = function () {
        if (twin.simInhaling) {
          twin.simInhaling = false;
          if (Date.now() - twin.inhaleStartedAt >= 200) twin.puffCount += 1;
        }
      };
      puffBtn.addEventListener('pointerdown', startPuff);
      window.addEventListener('pointerup', endPuff);
      puffBtn.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          twin.simInhaling = true;
          setTimeout(function () { twin.simInhaling = false; twin.puffCount += 1; }, 1200);
        }
      });
    }

    onClick('nc-sim-tilt', function () {
      twin.faultCode = FAULT.IMU_TILT;
      twin.pwmDutyPct = 0;
    });
    onClick('nc-sim-scorch', function () {
      twin.syrupGrams = 0;
      twin.faultCode = FAULT.SCORCH;
      twin.pwmDutyPct = 0;
    });
    onClick('nc-sim-sleep', function () {
      twin.autoSleep = !twin.autoSleep;
    });

    // Switches
    var swSteep = document.getElementById('nc-sw-steep');
    if (swSteep) {
      swSteep.addEventListener('change', function () {
        sendCommand(CMD.SET_AUTO_STEEP, swSteep.checked ? 1 : 0, 0, 0);
      });
    }

    // Sommelier PIN Modal Dialog & iOS Local Connection Modal (modern-web-guidance `dialog`)
    var pinDialog = document.getElementById('nc-pin-dialog');
    var pinInput = document.getElementById('nc-pin-input');
    var swLock = document.getElementById('nc-sw-lock');

    if (swLock && pinDialog) {
      swLock.addEventListener('change', function () {
        var desired = swLock.checked;
        swLock.checked = !desired;
        pinDialog.setAttribute('data-desired', desired ? '1' : '0');
        if (pinInput) pinInput.value = '1453';
        pinDialog.showModal();
      });

      pinDialog.addEventListener('close', function () {
        var choice = pinDialog.returnValue;
        pinDialog.returnValue = ''; // Mandatory reset per `dialog` guide
        if (choice === 'confirm') {
          var pinVal = Number((pinInput && pinInput.value) || 0);
          var enable = pinDialog.getAttribute('data-desired') === '1' ? 1 : 0;
          var rangePacked = (185 << 8) | 205;
          sendCommand(CMD.SET_LOUNGE_LOCK, enable, rangePacked, pinVal);
          syncSwitches();
        }
      });
    }

    var iosDialog = document.getElementById('nc-ios-dialog');
    if (iosDialog) {
      iosDialog.addEventListener('close', function () {
        iosDialog.returnValue = ''; // Mandatory reset per `dialog` guide
      });
    }

    // Fallback light-dismiss for all `dialog[closedby="any"]` when `closedBy` is unsupported (e.g. Safari)
    if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
      var outside = function (e, dlg) {
        var r = dlg.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      document.querySelectorAll('dialog[closedby="any"]').forEach(function (dlg) {
        var pressedOut = false;
        dlg.addEventListener('pointerdown', function (e) { pressedOut = outside(e, dlg); });
        dlg.addEventListener('pointerup', function (e) {
          if (pressedOut && outside(e, dlg)) dlg.close();
        });
      });
    }

    initConnectTabs();

    updateTransportBadge();
    stepDigitalTwin();
    setInterval(stepDigitalTwin, 250);
  }

  function initConnectTabs() {
    var tablist = document.getElementById('nc-tablist');
    if (!tablist) return;
    var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) {
      return document.getElementById(t.getAttribute('data-panel'));
    });

    function selectTab(nextTab, moveFocus) {
      tabs.forEach(function (t, i) {
        var active = (t === nextTab);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
        t.tabIndex = active ? 0 : -1;
        if (panels[i]) {
          if (active) {
            panels[i].removeAttribute('hidden');
            panels[i].tabIndex = 0;
          } else {
            panels[i].setAttribute('hidden', 'until-found');
            panels[i].removeAttribute('tabindex');
          }
        }
      });
      if (moveFocus) nextTab.focus();
      try {
        nextTab.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
      } catch (_) {}
    }

    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var rtl = document.documentElement.dir === 'rtl';
        var dir = 0;
        if (e.key === 'ArrowRight') dir = rtl ? -1 : 1;
        else if (e.key === 'ArrowLeft') dir = rtl ? 1 : -1;
        else if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); return; }
        else if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); return; }
        if (dir !== 0) {
          e.preventDefault();
          var nextIdx = (idx + dir + tabs.length) % tabs.length;
          selectTab(tabs[nextIdx], true);
        }
      });
      if (panels[idx]) {
        panels[idx].addEventListener('beforematch', function () { selectTab(tab, false); });
      }
    });
  }

  function onClick(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
