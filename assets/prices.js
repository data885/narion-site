/* NARION launch prices — insert only, no copy changes */
(function () {
  var PRICES = {
    yalin: [14900, 18900],
    cakil: [14900, 18900],
    nomad: [14900, 18900],
    yorunge: [15900, 19900],
    manolya: [17900, 22900],
    prizma: [17900, 22900],
    inci: [17900, 22900],
    kemer: [17900, 22900],
    fener: [17900, 22900],
    ocak: [17900, 22900],
    zeytin: [20900, 26900],
    ardic: [20900, 26900],
    servi: [20900, 26900],
    aura: [20900, 26900],
    ladin: [22900, 28900],
    koza: [23900, 29900],
    monolit: [24900, 31900],
    "smart-hmd": [12500, 14900]
  };

  var I18N = {
    tr: {
      badge: "LANSMAN",
      launch: "Lansman fiyatı",
      vat: "KDV dahil",
      period: "Lansman fiyatları, lansman döneminde verilen ön siparişler için geçerlidir.",
      note: "Lansman fiyatları, lansman döneminde verilen ön siparişler için geçerlidir. Tüm fiyatlara KDV dahildir.",
      hmd: "Ayrı satılır"
    },
    en: {
      badge: "LAUNCH",
      launch: "Launch price",
      vat: "incl. VAT",
      period: "Launch prices apply to pre-orders placed during the launch period.",
      note: "Launch prices apply to pre-orders placed during the launch period. All prices incl. VAT.",
      hmd: "Sold separately"
    },
    ar: {
      badge: "إطلاق",
      launch: "سعر الإطلاق",
      vat: "شامل الضريبة",
      period: "أسعار الإطلاق سارية على الطلبات المسبقة خلال فترة الإطلاق.",
      note: "أسعار الإطلاق سارية على الطلبات المسبقة خلال فترة الإطلاق. جميع الأسعار شاملة الضريبة.",
      hmd: "يُباع على حدة"
    },
    ru: {
      badge: "ЗАПУСК",
      launch: "Стартовая цена",
      vat: "включая НДС",
      period: "Стартовые цены действуют для предзаказов, оформленных в период запуска.",
      note: "Стартовые цены действуют для предзаказов, оформленных в период запуска. Все цены включают НДС.",
      hmd: "Продаётся отдельно"
    }
  };

  var lang = (document.documentElement.lang || "tr").slice(0, 2);
  if (!I18N[lang]) lang = "tr";
  var t = I18N[lang];

  function fmt(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₺";
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/narion[\s_-]*/g, "")
      .replace(/\.html.*/, "")
      .replace(/ı/g, "i")
      .replace(/İ/g, "i")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/[^a-z0-9-]/g, "");
  }

  function keyFrom(s) {
    var k = norm(s);
    if (PRICES[k]) return k;
    if (k.indexOf("smarthmd") !== -1 || k.indexOf("smart-hmd") !== -1 || k === "smarthmd") return "smart-hmd";
    return null;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function block(key, variant, extra) {
    var p = PRICES[key];
    if (!p) return null;
    var wrap = el("div", "n-price n-price--" + (variant || "card"));
    wrap.setAttribute("data-n-price", key);
    var badge = el("span", "n-price-badge", t.badge);
    badge.setAttribute("title", t.launch);
    wrap.appendChild(badge);
    var row = el("div", "n-price-row");
    var launch = el("span", "n-price-launch", fmt(p[0]));
    launch.setAttribute("aria-label", t.launch + " " + fmt(p[0]));
    row.appendChild(launch);
    var list = el("s", "n-price-list", fmt(p[1]));
    list.setAttribute("aria-label", fmt(p[1]));
    row.appendChild(list);
    wrap.appendChild(row);
    var vatLine = t.vat;
    if (key === "smart-hmd") vatLine = t.hmd + " · " + t.vat;
    wrap.appendChild(el("div", "n-price-vat", vatLine));
    if (extra) wrap.appendChild(el("p", "n-price-period", t.period));
    return wrap;
  }

  function injectCss() {
    if (document.getElementById("n-price-css")) return;
    var s = document.createElement("style");
    s.id = "n-price-css";
    s.textContent = [
      ".n-price{margin:10px 0 4px;display:flex;flex-direction:column;align-items:flex-start;gap:4px;line-height:1.2}",
      ".n-price-badge{display:inline-block;font-family:var(--f-mono),ui-monospace,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold,#d4af37);border:1px solid var(--gold,#d4af37);padding:2px 7px;border-radius:2px}",
      ".n-price-row{display:flex;align-items:baseline;flex-wrap:wrap;gap:8px 12px}",
      ".n-price-launch{font-family:var(--f-serif),Georgia,serif;font-size:26px;color:var(--gold-light,#e8cf7a);font-weight:500}",
      ".n-price-list{font-family:var(--f-mono),ui-monospace,monospace;font-size:14px;color:var(--text-muted,#9a9aa3);text-decoration:line-through;text-decoration-thickness:1px}",
      ".n-price-vat{font-family:var(--f-mono),ui-monospace,monospace;font-size:11px;letter-spacing:.06em;color:var(--text-muted,#9a9aa3)}",
      ".n-price-period{font-size:12px;color:var(--text-muted,#9a9aa3);line-height:1.45;max-width:46ch;margin:2px 0 0}",
      ".n-price--card .n-price-launch{font-size:20px}",
      ".n-price--card{padding:0 22px 8px}",
      ".n-price--detail{margin:0 0 20px}",
      ".n-price--detail .n-price-launch{font-size:34px}",
      ".n-price-note{margin:0 0 22px;font-size:13.5px;color:var(--text-muted,#9a9aa3);line-height:1.55;max-width:70ch}",
      "html[dir=\"rtl\"] .n-price,html[dir=\"rtl\"] .n-price-note{align-items:flex-end;text-align:right}",
      "html[dir=\"rtl\"] .n-price-row{flex-direction:row}",".card .n-price--card{padding:0 0 12px}"
    ].join("");
    document.head.appendChild(s);
  }

  function place(node, key, variant, extra, where, ref) {
    if (!node || node.querySelector('[data-n-price="' + key + '"]')) return;
    var b = block(key, variant, extra);
    if (!b) return;
    if (where === "before" && ref && ref.parentNode) ref.parentNode.insertBefore(b, ref);
    else if (where === "after" && ref && ref.parentNode) ref.parentNode.insertBefore(b, ref.nextSibling);
    else node.appendChild(b);
  }

  function run() {
    injectCss();

    var cards = document.querySelectorAll("a.mcard, .mcard");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var key = keyFrom(card.id) || keyFrom(card.getAttribute("href") || "");
      if (!key) continue;
      var go = card.querySelector(".go");
      place(card, key, "card", false, go ? "before" : "append", go);
    }

    var list = document.getElementById("modelList");
    if (list && !document.querySelector(".n-price-note")) {
      var note = el("p", "n-price-note", t.note);
      list.parentNode.insertBefore(note, list);
    }

    var path = (location.pathname || "").split("/").pop() || "";
    var pageKey = keyFrom(path);
    if (pageKey) {
      var h1 = document.querySelector("main h1, h1");
      if (h1 && !document.querySelector("main [data-n-price]")) {
        var lead = h1.nextElementSibling;
        var ref = lead && /lead/i.test(lead.className) ? lead : h1;
        var host = h1.parentNode;
        place(host, pageKey, "detail", true, "after", ref);
      }
    }

    var featured = document.querySelectorAll('a[href*="narion-"]');
    for (var j = 0; j < featured.length; j++) {
      var a = featured[j];
      if (a.classList.contains("mcard")) continue;
      var key2 = keyFrom(a.getAttribute("href") || "");
      if (!key2) continue;
      var box = a.closest(".card, article, .mcard");
      if (!box || box.querySelector("[data-n-price]")) continue;
      var p = box.querySelector("p");
      place(box, key2, "card", false, p ? "after" : "before", p || a);
    }
  }

  injectCss();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
