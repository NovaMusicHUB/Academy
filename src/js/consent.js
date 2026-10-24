/*
 * Acordul pentru cookie-urile de marketing (Meta Pixel).
 * Pixelul Facebook se încarcă DOAR după ce vizitatorul apasă „Accept”. Alegerea se ține minte 6 luni.
 * Cerință GDPR / Legea 506/2004: fără acord, nu se pun cookie-uri de marketing.
 */
(function () {
  var KEY = "nova_consent_marketing";
  var PIXEL_ID = "1841691336722567";
  var MAX_AGE = 1000 * 60 * 60 * 24 * 182;

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v && v.t && Date.now() - v.t < MAX_AGE) return v.ok === true ? "yes" : "no";
    } catch (e) {}
    return null;
  }
  function save(ok) {
    try { localStorage.setItem(KEY, JSON.stringify({ ok: ok, t: Date.now() })); } catch (e) {}
  }

  function loadPixel() {
    if (window.fbq) return;
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  function en() {
    var l = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    try { l = localStorage.getItem("lang") || l; } catch (e) {}
    return l.indexOf("en") === 0;
  }

  function banner() {
    var E = en();
    var box = document.createElement("div");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-live", "polite");
    box.setAttribute("aria-label", E ? "Cookies" : "Cookie-uri");
    box.style.cssText =
      "position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:560px;margin:0 auto;" +
      "background:#241F33;color:#fff;border-radius:16px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.25);" +
      "font:14px/1.45 'DM Sans',system-ui,sans-serif";
    var policy = location.pathname.indexOf("/politica-confidentialitate") === 0 ? "#cookies" : "/politica-confidentialitate/#cookies";
    box.innerHTML =
      '<p style="margin:0 0 12px">' +
      (E
        ? "We use cookies for marketing (Meta / Facebook) only if you agree. The site works the same either way."
        : "Folosim cookie-uri de marketing (Meta / Facebook) doar dacă ești de acord. Site-ul funcționează la fel oricum.") +
      ' <a href="' + policy + '" style="color:#E9B872">' + (E ? "Details" : "Detalii") + "</a></p>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" data-c="yes" style="flex:1;min-width:120px;border:0;border-radius:10px;padding:10px 14px;background:#C98A3B;color:#fff;font-weight:600;cursor:pointer">' +
      (E ? "Accept" : "Accept") + "</button>" +
      '<button type="button" data-c="no" style="flex:1;min-width:120px;border:1px solid rgba(255,255,255,.35);border-radius:10px;padding:10px 14px;background:transparent;color:#fff;font-weight:600;cursor:pointer">' +
      (E ? "Decline" : "Refuz") + "</button></div>";
    box.addEventListener("click", function (ev) {
      var c = ev.target && ev.target.getAttribute && ev.target.getAttribute("data-c");
      if (!c) return;
      save(c === "yes");
      if (c === "yes") loadPixel();
      box.remove();
    });
    document.body.appendChild(box);
  }

  // linkul „Setări cookie-uri” din politica de confidențialitate poate redeschide alegerea
  window.novaCookieSettings = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    banner();
  };

  var choice = read();
  if (choice === "yes") loadPixel();
  else if (choice === null) {
    if (document.body) banner();
    else document.addEventListener("DOMContentLoaded", banner);
  }
})();
