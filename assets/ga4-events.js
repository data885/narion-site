(function () {
  "use strict";
  function track(name, params) {
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, params || {});
    } catch (e) {}
  }
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a") : null;
    if (!a) return;
    var href = (a.getAttribute("href") || "").toLowerCase();
    if (href.indexOf("wa.me") > -1 || href.indexOf("whatsapp") > -1) {
      track("whatsapp_click", { link_url: href });
    } else if (href.endsWith(".pdf") || href.indexOf("katalog.html") > -1) {
      track("catalog_download", { link_url: href });
    } else if (href.indexOf("tel:") === 0) {
      track("phone_click", { link_url: href });
    }
  });
  document.addEventListener("submit", function (ev) {
    var f = ev.target;
    if (f && f.tagName === "FORM") {
      track("generate_lead", { page: location.pathname });
    }
  });
})();
