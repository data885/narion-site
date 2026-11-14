/* NARION — mobil menü, Popover polyfill ve Sabit Lüks WhatsApp Hattı (0546 733 1184) */
(function () {
  'use strict';

  // 1. Popover API progresif geliştirme / polyfill (content-first-noise-reduction standardı)
  if (!Object.hasOwn(HTMLElement.prototype, "popover")) {
    var s = document.createElement("script");
    s.src = "https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js";
    s.async = true;
    document.head.appendChild(s);
  }

  // 2. Aktif Sekme Erişilebilirlik Eşitlemesi (aria-current="page")
  var aktifBaglantilar = document.querySelectorAll('.menu a.on');
  for (var i = 0; i < aktifBaglantilar.length; i++) {
    if (!aktifBaglantilar[i].hasAttribute('aria-current')) {
      aktifBaglantilar[i].setAttribute('aria-current', 'page');
    }
  }

  // 3. Sabit (Floating) Lüks WhatsApp & Hızlı Demo Balonu (0546 733 1184)
  // Not: .wa-menu-btn ölçüm öncesi eklenir; .is-wide modunda CSS ile gizlendiğinden satır genişliğini şişirmez.
  if (!document.getElementById('narion-wa-float')) {
    var lang = (document.documentElement.lang || 'tr').toLowerCase();
    var labelMain = 'WhatsApp Hızlı Hat';
    var labelSub = '0546 733 1184 • Demo & Teklif';
    var msg = 'Merhaba NARION, NARION web sitesinden ulaşıyorum. Smart HMD ve nargile koleksiyonu hakkında bilgi / demo talep ediyorum.';

    if (lang.indexOf('en') === 0) {
      labelMain = 'WhatsApp Concierge';
      labelSub = '+90 546 733 1184 • Direct Line';
      msg = 'Hello NARION, I am reaching out from your website regarding Smart HMD and the hookah collection.';
    } else if (lang.indexOf('ar') === 0) {
      labelMain = 'واتساب المباشر';
      labelSub = '+90 546 733 1184';
      msg = 'مرحباً ناريون، أتواصل معكم من الموقع الإلكتروني بخصوص Smart HMD ومجموعة النرجيلة.';
    } else if (lang.indexOf('ru') === 0) {
      labelMain = 'WhatsApp Линия';
      labelSub = '+90 546 733 1184';
      msg = 'Здравствуйте, пишу с сайта NARION по поводу Smart HMD и коллекции кальянов.';
    }

    var waUrl = 'https://wa.me/905467331184?text=' + encodeURIComponent(msg);

    var waBtn = document.createElement('a');
    waBtn.id = 'narion-wa-float';
    waBtn.className = 'wa-float';
    waBtn.href = waUrl;
    waBtn.target = '_blank';
    waBtn.rel = 'noopener';
    waBtn.setAttribute('aria-label', labelMain + ' ' + labelSub);
    waBtn.innerHTML =
      '<span class="wa-ico" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.83-.11-.42-.13-.97-.31-1.67-.61-2.94-1.27-4.86-4.25-5.01-4.45-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.58.82 2 .89 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.17 1.4z"/></svg>' +
      '</span>' +
      '<span class="wa-txt">' +
        '<b>' + labelMain + '</b>' +
        '<small>' + labelSub + '</small>' +
      '</span>';

    document.body.appendChild(waBtn);

    // Mobil menü çekmecesine de doğrudan WhatsApp butonu ekle
    var headCta = document.querySelector('.head-cta');
    if (headCta && !headCta.querySelector('.wa-menu-btn')) {
      var mWa = document.createElement('a');
      mWa.className = 'btn sm wa-menu-btn';
      mWa.href = waUrl;
      mWa.target = '_blank';
      mWa.rel = 'noopener';
      mWa.style.cssText = 'background:rgba(47,212,122,0.14);border:1px solid rgba(47,212,122,0.5);color:#2fd47a;font-weight:700';
      mWa.textContent = '💬 WhatsApp: 0546 733 1184';
      headCta.appendChild(mWa);
    }
  }

  // 4. Dinamik Üst Menü Sığdırma & Mobil Çekmece Kontrolü (modern-web-guidance: navbar ResizeObserver)
  var siteHead = document.querySelector('.site-head');
  var dugme = document.querySelector('.burger');
  var kap = document.querySelector('.head-in');
  var menuEl = kap ? kap.querySelector('.menu') : null;
  var logoEl = kap ? kap.querySelector('.logo') : null;
  var ctaEl = kap ? kap.querySelector('.head-cta') : null;

  if (siteHead && dugme && kap && menuEl) {
    var isWide = false;
    var lastCollapsedWidth = -1;
    var measureRaf = 0;

    function ayarla(acik) {
      kap.classList.toggle('acik', acik);
      dugme.setAttribute('aria-expanded', acik ? 'true' : 'false');
    }

    function satirSigiyorMu() {
      if (kap.scrollWidth > kap.clientWidth + 1) return false;
      var st = window.getComputedStyle(kap);
      var padL = parseFloat(st.paddingLeft) || 0;
      var padR = parseFloat(st.paddingRight) || 0;
      var kapRect = kap.getBoundingClientRect();
      var minLeft = kapRect.left + padL - 1.5;
      var maxRight = kapRect.right - padR + 1.5;
      var parcalar = [logoEl, menuEl, ctaEl];
      for (var k = 0; k < parcalar.length; k++) {
        var el = parcalar[k];
        if (!el) continue;
        var r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        if (r.left < minLeft || r.right > maxRight) return false;
      }
      // Kardeş öğelerin birbiri üstüne binmediğini doğrula
      if (logoEl && menuEl && ctaEl) {
        var rL = logoEl.getBoundingClientRect();
        var rM = menuEl.getBoundingClientRect();
        var rC = ctaEl.getBoundingClientRect();
        var isRtl = document.documentElement.dir === 'rtl';
        if (!isRtl) {
          if (rM.left < rL.right - 1 || rC.left < rM.right - 1) return false;
        } else {
          if (rM.right > rL.left + 1 || rC.right > rM.left + 1) return false;
        }
      }
      return true;
    }

    function olcVeUygula(zorla) {
      var curWidth = siteHead.clientWidth;
      // Dar moddayken yalnızca üst çubuk genişlediğinde yeniden ölç (layout thrashing önlemi)
      if (!zorla && !isWide && lastCollapsedWidth >= 0 && curWidth <= lastCollapsedWidth) {
        return;
      }

      var acikIdi = kap.classList.contains('acik');
      siteHead.classList.add('is-measuring', 'nav-measured', 'is-wide');
      if (acikIdi) kap.classList.remove('acik');

      var sigdi = satirSigiyorMu();
      isWide = sigdi;

      if (sigdi) {
        lastCollapsedWidth = -1;
        dugme.setAttribute('aria-expanded', 'false');
      } else {
        siteHead.classList.remove('is-wide');
        lastCollapsedWidth = curWidth;
        if (acikIdi) {
          kap.classList.add('acik');
          dugme.setAttribute('aria-expanded', 'true');
        }
      }

      if (measureRaf) cancelAnimationFrame(measureRaf);
      measureRaf = requestAnimationFrame(function () {
        siteHead.classList.remove('is-measuring');
        measureRaf = 0;
      });
    }

    dugme.addEventListener('click', function () {
      ayarla(!kap.classList.contains('acik'));
    });

    kap.addEventListener('click', function (e) {
      if (e.target.closest('.menu a, .head-cta a')) ayarla(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') ayarla(false);
    });

    olcVeUygula(true);

    if ('ResizeObserver' in window) {
      var navRo = new ResizeObserver(function () {
        olcVeUygula(false);
      });
      navRo.observe(siteHead);
      navRo.observe(menuEl);
    } else {
      window.addEventListener('resize', function () {
        olcVeUygula(true);
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        olcVeUygula(true);
      });
    }
  }

  // 5. Yatay Kaydırmalı Sekme Şeritleri Kenar Solma Yedeği (modern-web-guidance: tabs IntersectionObserver fallback)
  if (window.CSS && !CSS.supports('animation-timeline', 'scroll()') && 'IntersectionObserver' in window) {
    var scrollers = document.querySelectorAll('.narion-tablist, .filters');
    for (var sIdx = 0; sIdx < scrollers.length; sIdx++) {
      (function (scroller) {
        var first = scroller.firstElementChild;
        var last = scroller.lastElementChild;
        if (!first || !last || first === last) return;
        var io = new IntersectionObserver(function (entries) {
          for (var eIdx = 0; eIdx < entries.length; eIdx++) {
            var entry = entries[eIdx];
            var cls = entry.target === first ? 'more-start' : 'more-end';
            scroller.classList.toggle(cls, entry.intersectionRatio < 1);
          }
        }, { root: scroller, threshold: 1, rootMargin: '1px' });
        io.observe(first);
        io.observe(last);
      })(scrollers[sIdx]);
    }
  }

  // 4. GA4 (G-ZJZ819TVPE) Dönüşüm & Etkileşim Takibi (WhatsApp, Form, Tanıtım Filmleri)
  document.addEventListener('click', function (e) {
    if (typeof window.gtag !== 'function') return;
    var a = e.target.closest('a[href*="wa.me/"], a[href^="tel:"], a[download]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('wa.me/') !== -1) {
      window.gtag('event', 'generate_lead', { method: 'whatsapp', link_url: href });
    } else if (href.indexOf('tel:') === 0) {
      window.gtag('event', 'generate_lead', { method: 'phone_call', link_url: href });
    } else if (a.hasAttribute('download')) {
      window.gtag('event', 'file_download', { file_name: a.getAttribute('download') || href });
    }
  });

  document.addEventListener('play', function (e) {
    if (typeof window.gtag !== 'function') return;
    var v = e.target;
    if (v && v.tagName === 'VIDEO' && v.id && !v.dataset.gaPlayed) {
      v.dataset.gaPlayed = '1';
      window.gtag('event', 'video_start', { video_title: v.id });
    }
  }, true);
})();
