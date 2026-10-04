/* NARION — form gönderimi
 *
 * Üç form (ön kayıt, B2B, iletişim) daha önce HİÇBİR YERE göndermiyordu:
 * onsubmit yalnız event.preventDefault() yapıp başarı panelini açıyordu.
 * Ziyaretçi "alındı" görüyor, talep kayboluyordu.
 *
 * Artık form Apps Script ucuna JSON POST eder ve başarı paneli YALNIZCA
 * sunucu ok dönerse açılır. Uç tanımlı değilse (UC boş) form mailto'ya
 * düşer — yanlış vaat vermektense posta programını açmak doğru.
 */
(function () {
  'use strict';

  // Apps Script dağıtımından sonra buraya /exec adresi yazılır. Boşken mailto modu.
  var UC = 'https://script.google.com/macros/s/AKfycbxorhyQVZvEZC7KFM-NIzekI1XDqCVw_RcjohQP1xwC84itMyVlBY7Vze3Oe-VLgd0Q4g/exec';
  var ADRES = 'info@narionhookah.com';

  var BASLIK = {
    'on-kayit': 'NARION ön kayıt',
    'b2b': 'NARION B2B başvurusu',
    'iletisim': 'NARION iletişim'
  };

  var ACILIS = Date.now();

  function metin(f, ad) {
    var e = f.querySelector('[name="' + ad + '"]');
    if (!e) return '';
    if (e.type === 'radio') {
      var s = f.querySelector('[name="' + ad + '"]:checked');
      return s ? (s.getAttribute('data-metin') || s.value) : '';
    }
    if (e.tagName === 'SELECT') return e.options[e.selectedIndex] ? e.options[e.selectedIndex].text : '';
    return e.value;
  }

  function topla(f) {
    var v = {
      tur: f.getAttribute('data-narion'),
      dil: (document.documentElement.lang || 'tr'),
      sayfa: location.pathname,
      sure: Math.round((Date.now() - ACILIS) / 1000),
      website: ''
    };
    var tuzak = f.querySelector('[name="website"]');
    if (tuzak) v.website = tuzak.value;
    f.querySelectorAll('[name^="f_"]').forEach(function (e) {
      if (e.type === 'radio' && !e.checked) return;
      v[e.name] = metin(f, e.name);
    });
    return v;
  }

  function mailtoAc(f, v) {
    var govde = Object.keys(v)
      .filter(function (k) { return k.indexOf('f_') === 0 && v[k]; })
      .map(function (k) {
        var et = f.querySelector('[name="' + k + '"]');
        var ad = (et && et.getAttribute('data-etiket')) || k.replace('f_', '');
        return ad + ': ' + v[k];
      }).join('\n');
    location.href = 'mailto:' + ADRES +
      '?subject=' + encodeURIComponent(BASLIK[v.tur] || 'NARION') +
      '&body=' + encodeURIComponent(govde);
  }

  function durum(f, metinIcerik, hataMi) {
    var k = f.querySelector('.form-durum');
    if (!k) {
      k = document.createElement('p');
      k.className = 'form-durum';
      k.setAttribute('role', 'status');
      k.style.cssText = 'margin-top:14px;font-size:14px;line-height:1.5';
      f.appendChild(k);
    }
    k.style.color = hataMi ? '#ef5f5f' : 'var(--text-muted,#9c9ca4)';
    k.textContent = metinIcerik;
  }

  function basariyiGoster(f, yanit) {
    // Sayfa kendi başarı panelini dolduruyorsa (ön kayıt özeti gibi) ona haber ver
    if (typeof window.narionBasariOncesi === 'function') {
      try { window.narionBasariOncesi(f, yanit || {}); } catch (hata) { /* panel yine de açılsın */ }
    }
    var hedef = f.getAttribute('data-basari');
    var panel = hedef && document.getElementById(hedef);
    if (panel) {
      panel.style.display = 'block';
      f.style.display = 'none';
      if (panel.scrollIntoView) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      durum(f, 'Talebiniz alındı. En kısa sürede dönüş yapacağız.', false);
    }
  }

  function baglan(f) {
    f.setAttribute('novalidate', '');
    f.addEventListener('submit', function (olay) {
      olay.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }

      var v = topla(f);
      var dugme = f.querySelector('[type="submit"], button:not([type="button"])');

      if (!UC) { mailtoAc(f, v); return; }

      if (dugme) { dugme.disabled = true; dugme.dataset.eski = dugme.textContent; dugme.textContent = 'Gönderiliyor…'; }
      durum(f, 'Gönderiliyor…', false);

      fetch(UC, {
        method: 'POST',
        // text/plain: Apps Script'e ön kontrol (preflight) isteği gitmesin
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(v)
      })
        .then(function (y) { return y.json(); })
        .then(function (y) {
          if (y && y.ok) { basariyiGoster(f, y); return; }
          throw new Error(y && y.neden ? y.neden : 'bilinmeyen');
        })
        .catch(function () {
          durum(f, 'Gönderilemedi. Lütfen ' + ADRES + ' adresine yazın ya da tekrar deneyin.', true);
          if (dugme) { dugme.disabled = false; dugme.textContent = dugme.dataset.eski || 'Gönder'; }
        });
    });
  }

  document.querySelectorAll('form[data-narion]').forEach(baglan);
})();
