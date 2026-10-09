/* ── NOVA MUSIC ACADEMY — i18n Engine ─────────────────────── */
(function () {
  const STORAGE_KEY = "nma_lang";
  const DEFAULT_LANG = "ro";

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
    updateSwitcher(lang);
    document.documentElement.lang = lang;
  }

  function applyLang(lang) {
    if (!window.NMA_TRANSLATIONS) return;
    const t = window.NMA_TRANSLATIONS[lang];
    if (!t) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key] !== undefined) {
        if (el.hasAttribute("data-i18n-html")) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    // Placeholder attributes
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    // aria-label attributes
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (t[key] !== undefined) el.setAttribute("aria-label", t[key]);
    });
  }

  function updateSwitcher(lang) {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("lang-btn--active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function init() {
    // Wire up switcher buttons
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });

    // Apply saved language on load
    const saved = getLang();
    applyLang(saved);
    updateSwitcher(saved);
    document.documentElement.lang = saved;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
