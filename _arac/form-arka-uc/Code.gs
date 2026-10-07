/**
 * NARION — site formlarının arka ucu (Google Apps Script web app).
 *
 * Sitedeki üç form (ön kayıt, B2B başvurusu, iletişim) buraya JSON
 * (text/plain) POST eder. Script:
 *   1) tuzak alan + süre + zorunlu alan kontrolü yapar (spam),
 *   2) talebi "NARION — Talepler" e-tablosunda kendi sayfasına yazar,
 *   3) ALICI adresine e-posta atar; "Yanıtla" doğrudan müşteriye gider.
 *
 * info@narionhookah.com hesabında kurulur. Adımlar: KURULUM.md
 *
 * Not: bu script kurulana kadar formlar mailto'ya düşer (assets/form.js),
 * yani hiçbir talep sessizce kaybolmaz.
 */

const ALICI = 'info@narionhookah.com';
const TABLO_ADI = 'NARION — Talepler';

// form türü -> [sayfa adı, alan listesi]
// Alan adları sitedeki name="..." değerleriyle birebir aynı olmalı.
const TURLER = {
  'on-kayit': ['Ön kayıt', [
    ['f_ad', 'Ad Soyad'],
    ['f_tel', 'Telefon / WhatsApp'],
    ['f_eposta', 'E-posta'],
    ['f_sehir', 'Şehir / Ülke'],
    ['f_model', 'Model tercihi'],
    ['f_paket', 'Paket'],
    ['f_kaplama', 'Kaplama / renk'],
    ['f_not', 'Gravür notu'],
  ]],
  'b2b': ['B2B', [
    ['f_ad', 'Yetkili'],
    ['f_isletme', 'İşletme / Lounge'],
    ['f_tel', 'Telefon'],
    ['f_eposta', 'E-posta'],
    ['f_sehir', 'Şehir / İlçe'],
    ['f_masa', 'Masa sayısı'],
    ['f_model', 'Tercih edilen model'],
  ]],
  'iletisim': ['İletişim', [
    ['f_ad', 'Ad Soyad'],
    ['f_eposta', 'E-posta'],
    ['f_tel', 'Telefon'],
    ['f_konu', 'Konu'],
    ['f_mesaj', 'Mesaj'],
  ]],
};

const DIL_AD = { tr: 'Türkçe', en: 'İngilizce', ar: 'Arapça', ru: 'Rusça' };
const EPOSTA_DESENI = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function doPost(e) {
  try {
    const v = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    const tur = String(v.tur || '').trim();
    if (!TURLER[tur]) return cevap_(false, 'tur');

    // --- spam kapıları: bota ipucu vermemek için sessizce "ok" dönüyoruz
    if (v.website) return cevap_(true);                // tuzak alan dolduruldu
    if (Number(v.sure || 0) < 4) return cevap_(true);  // 4 sn'den hızlı gönderildi

    const [, alanlar] = TURLER[tur];
    const temiz = {};
    alanlar.forEach(([k]) => { temiz[k] = String(v[k] || '').trim().slice(0, 3000); });

    if (!temiz.f_ad) return cevap_(false, 'eksik');
    // iletişim ve ön kayıtta e-posta zorunlu; B2B'de telefon yeterli
    if (tur !== 'b2b' && !EPOSTA_DESENI.test(temiz.f_eposta)) return cevap_(false, 'eksik');
    if (tur === 'b2b' && !temiz.f_tel) return cevap_(false, 'eksik');
    if (temiz.f_eposta && !EPOSTA_DESENI.test(temiz.f_eposta)) temiz.f_eposta = '';

    // aynı kişiden 10 dk içinde en fazla 3 gönderim
    const kimlik = (temiz.f_eposta || temiz.f_tel || '').toLowerCase();
    if (kimlik) {
      const onbellek = CacheService.getScriptCache();
      const anahtar = 'n_' + tur + '_' + kimlik;
      const n = Number(onbellek.get(anahtar) || 0);
      if (n >= 3) return cevap_(true);
      onbellek.put(anahtar, String(n + 1), 600);
    }

    const dil = DIL_AD[v.dil] || String(v.dil || '').slice(0, 5);
    const sayfa = String(v.sayfa || '').slice(0, 300);

    // Rezervasyon kodu sunucuda üretilir ve tabloya yazılır; eskiden tarayıcıda
    // Math.random() ile uyduruluyordu, yani hiçbir kayda karşılık gelmiyordu.
    const kod = tur === 'on-kayit' ? kodUret_() : '';
    tabloyaYaz_(tur, temiz, dil, sayfa, kod);
    postala_(tur, temiz, dil, kod);
    return cevap_(true, null, kod ? { kod: kod } : null);
  } catch (hata) {
    console.error(hata);
    return cevap_(false, 'sunucu');
  }
}


function tabloyaYaz_(tur, t, dil, sayfa, kod) {
  const [sayfaAdi, alanlar] = TURLER[tur];
  // formül enjeksiyonuna karşı: = + - @ ile başlayan hücreyi metin yap
  const hucre = s => (/^[=+\-@]/.test(s) ? "'" + s : s);
  const satir = [new Date(), dil]
    .concat(alanlar.map(([k]) => hucre(t[k])))
    .concat([hucre(sayfa), kod || '', 'Yeni']);
  sayfaBul_(sayfaAdi, alanlar).appendRow(satir);
}


/** NAR-2026-B1-#### — tablodaki satır sayısından türetilir, çakışmaz. */
function kodUret_() {
  const s = sayfaBul_(TURLER['on-kayit'][0], TURLER['on-kayit'][1]);
  const sira = Math.max(1, s.getLastRow());   // başlık satırı 1
  return 'NAR-2026-B1-' + String(1000 + sira).slice(-4);
}


function postala_(tur, t, dil, kod) {
  const [sayfaAdi, alanlar] = TURLER[tur];
  const baslik = { 'on-kayit': 'Yeni ön kayıt', 'b2b': 'Yeni B2B başvurusu', 'iletisim': 'Yeni mesaj' }[tur];
  const ek = tur === 'b2b' ? (t.f_isletme || '') : (t.f_model || t.f_konu || '');
  const konu = baslik + ' — ' + t.f_ad + (ek ? ' — ' + ek : '') + (kod ? ' — ' + kod : '');

  const satirlar = alanlar.filter(([k]) => t[k]).map(([k, ad]) =>
    '<tr><td style="padding:6px 16px 6px 0;color:#8a7a5e;vertical-align:top;white-space:nowrap">' + kacir_(ad) +
    '</td><td style="padding:6px 0;color:#1a1a1a">' + kacir_(t[k]).replace(/\n/g, '<br>') + '</td></tr>').join('');

  const html = '<div style="font-family:Arial,sans-serif;font-size:14px">' +
    '<p style="color:#9a7822;letter-spacing:.12em;font-size:11px">NARION · ' +
    kacir_(sayfaAdi.toUpperCase()) + ' · ' + kacir_(dil) + '</p>' +
    (kod ? '<p style="font-size:13px"><b>Rezervasyon kodu:</b> ' + kacir_(kod) + '</p>' : '') +
    '<table style="border-collapse:collapse">' + satirlar + '</table>' +
    (t.f_eposta
      ? '<p style="color:#8a8a8a;font-size:12px;margin-top:20px">"Yanıtla" doğrudan ' +
        kacir_(t.f_eposta) + ' adresine gider.</p>'
      : '<p style="color:#8a8a8a;font-size:12px;margin-top:20px">E-posta verilmemiş — telefondan dönülecek.</p>') +
    '<p style="color:#9a9a9a;font-size:12px">Tüm talepler: ' + tablo_().getUrl() + '</p></div>';

  const secenek = { to: ALICI, name: 'NARION', subject: konu, htmlBody: html };
  if (t.f_eposta) secenek.replyTo = t.f_eposta;
  MailApp.sendEmail(secenek);
}


function tablo_() {
  const ozellik = PropertiesService.getScriptProperties();
  const id = ozellik.getProperty('TABLO_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (hata) { /* silinmişse yenisini kur */ }
  }
  const yeni = SpreadsheetApp.create(TABLO_ADI);
  ozellik.setProperty('TABLO_ID', yeni.getId());
  return yeni;
}


function sayfaBul_(sayfaAdi, alanlar) {
  const kitap = tablo_();
  let s = kitap.getSheetByName(sayfaAdi);
  if (!s) {
    s = kitap.getSheets().length === 1 && kitap.getSheets()[0].getLastRow() === 0
      ? kitap.getSheets()[0].setName(sayfaAdi)
      : kitap.insertSheet(sayfaAdi);
    s.appendRow(['Tarih', 'Dil'].concat(alanlar.map(([, ad]) => ad)).concat(['Sayfa', 'Kod', 'Durum']));
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, alanlar.length + 5).setFontWeight('bold');
  }
  return s;
}


function cevap_(ok, neden, ek) {
  const g = { ok: ok, neden: neden || null };
  if (ek) Object.keys(ek).forEach(k => { g[k] = ek[k]; });
  return ContentService.createTextOutput(JSON.stringify(g))
    .setMimeType(ContentService.MimeType.JSON);
}


function kacir_(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}


/** Kurulumda bir kez elle çalıştırılır: izinleri ister, tabloyu kurar, üç deneme maili atar. */
function kurulumTesti() {
  Object.keys(TURLER).forEach(tur => {
    const [, alanlar] = TURLER[tur];
    const t = {};
    alanlar.forEach(([k, ad]) => { t[k] = 'TEST — ' + ad; });
    t.f_eposta = ALICI;
    const kod = tur === 'on-kayit' ? kodUret_() : '';
    tabloyaYaz_(tur, t, 'Türkçe', 'kurulum testi', kod);
    postala_(tur, t, 'Türkçe', kod);
  });
  console.log('Tablo: ' + tablo_().getUrl());
}
