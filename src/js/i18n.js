/* ── NOVA MUSIC ACADEMY — i18n Engine ─────────────────────── */
(function () {
  const STORAGE_KEY = "nma_lang";
  const DEFAULT_LANG = "ro";
  const SUPPORTED = ["ro", "en"];

  // [atribut-cheie, atribut-țintă] pentru elementele traduse prin atribute
  const ATTR_BINDINGS = [
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-aria", "aria-label"],
    ["data-i18n-alt", "alt"],
    ["data-i18n-content", "content"],
  ];

  // Conținutul ORIGINAL din HTML, memorat înainte de prima traducere,
  // ca să putem reveni exact la el când limba curentă nu are cheia.
  const originals = new WeakMap();
  let titleOriginal = null;
  let titleTranslated = false;

  function readStoredLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.includes(saved) ? saved : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  let currentLang = readStoredLang();

  function lookup(lang, key) {
    const all = window.NMA_TRANSLATIONS;
    const dict = all && all[lang];
    if (!dict || !key) return undefined;
    return dict[key];
  }

  function stateOf(el) {
    let state = originals.get(el);
    if (!state) {
      state = { html: null, textApplied: false, attrs: {} };
      originals.set(el, state);
    }
    return state;
  }

  function applyText(lang, el) {
    const state = stateOf(el);
    if (state.html === null) state.html = el.innerHTML;

    const isHtml = el.hasAttribute("data-i18n-html");
    const key = el.getAttribute(isHtml ? "data-i18n-html" : "data-i18n");
    const value = lookup(lang, key);
    if (value !== undefined) {
      if (isHtml) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
      state.textApplied = true;
    } else if (state.textApplied) {
      el.innerHTML = state.html;
      state.textApplied = false;
    }
  }

  function applyAttr(lang, el, keyAttr, targetAttr) {
    const state = stateOf(el);
    if (!(targetAttr in state.attrs)) {
      state.attrs[targetAttr] = el.getAttribute(targetAttr);
    }

    const value = lookup(lang, el.getAttribute(keyAttr));
    const next = value !== undefined ? value : state.attrs[targetAttr];
    if (next === null) {
      el.removeAttribute(targetAttr);
    } else {
      el.setAttribute(targetAttr, next);
    }
  }

  function applyTitle(lang) {
    const el = document.querySelector("[data-i18n-title]");
    if (!el) return;
    if (titleOriginal === null) titleOriginal = document.title;

    const value = lookup(lang, el.getAttribute("data-i18n-title"));
    if (value !== undefined) {
      document.title = value;
      titleTranslated = true;
    } else if (titleTranslated) {
      document.title = titleOriginal;
      titleTranslated = false;
    }
  }

  function applyLang(lang) {
    document.querySelectorAll("[data-i18n], [data-i18n-html]").forEach((el) => {
      applyText(lang, el);
    });

    ATTR_BINDINGS.forEach(([keyAttr, targetAttr]) => {
      document.querySelectorAll(`[${keyAttr}]`).forEach((el) => {
        applyAttr(lang, el, keyAttr, targetAttr);
      });
    });

    applyTitle(lang);
  }

  function updateSwitcher(lang) {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("lang-btn--active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  // Linkurile spre portal duc și limba aleasă: portalul o citește din ?lang= și o ține minte
  function syncPortalLinks(lang) {
    document.querySelectorAll('a[href*="portal.novamusicacademy.ro"]').forEach((a) => {
      try {
        const u = new URL(a.href);
        u.searchParams.set("lang", lang);
        a.href = u.toString();
      } catch (e) {
        // link neobișnuit: îl lăsăm cum e
      }
    });
  }

  function render(lang) {
    applyLang(lang);
    syncPortalLinks(lang);
    updateSwitcher(lang);
    document.documentElement.lang = lang;
    document.dispatchEvent(
      new CustomEvent("nma:langchange", { detail: { lang } }),
    );
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // Stocarea poate fi indisponibilă (ex. modul privat); limba rămâne activă
    }
    render(lang);
  }

  function init() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });

    render(currentLang);
  }

  window.NMA_getLang = function () {
    return currentLang;
  };

  window.NMA_t = function (key, fallback) {
    const all = window.NMA_TRANSLATIONS || {};
    const current = all[currentLang] || {};
    if (current[key] !== undefined) return current[key];
    if (all[DEFAULT_LANG] && all[DEFAULT_LANG][key] !== undefined) {
      return all[DEFAULT_LANG][key];
    }
    return fallback !== undefined ? fallback : key;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
