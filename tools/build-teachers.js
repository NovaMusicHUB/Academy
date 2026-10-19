#!/usr/bin/env node
/*
 * Genereaza paginile individuale ale profesorilor (link distribuibil):
 *   src/profesori/<slug>/index.html
 *   src/js/translations-teachers.js
 *
 * Sursa: profilurile din src/js/main.js (obiectul `data` din modalul profesorilor)
 * si textele RO/EN din src/js/translations.js + src/js/translations-app.js.
 *
 * Rulare (din radacina proiectului Academy):
 *   node tools/build-teachers.js
 *
 * Paginile sunt statice (continutul e in HTML, fara JavaScript), ca sa fie
 * indexabile si sa aiba previzualizare corecta cand linkul e distribuit.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..", "src");
const SITE = "https://novamusicacademy.ro";
const PORTAL = "https://portal.novamusicacademy.ro";
const PIXEL_ID = "1841691336722567";

function loadDictionaries() {
  const ctx = { window: {} };
  ctx.window = ctx;
  for (const f of ["js/translations.js", "js/translations-app.js"]) {
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
  }
  return ctx.NMA_TRANSLATIONS;
}

function loadTeachers() {
  const src = fs.readFileSync(path.join(ROOT, "js/main.js"), "utf8");
  const re = /const data = (\{[\s\S]*?\n  \});/g;
  let block = null;
  let m;
  while ((m = re.exec(src))) {
    if (m[1].includes('"jessica-diana"')) block = m[1];
  }
  if (!block) throw new Error("Nu am gasit profilurile profesorilor in js/main.js");
  const base = "assets/images/Content%20Profesori/";
  const quote = (k) => ({ quote: k });
  return vm.runInNewContext("(" + block + ")", { base, quote });
}

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const hasHtml = (s) => /<[a-z][\s\S]*>/i.test(s);
const plain = (s) => (hasHtml(s) ? s : esc(s));
const stripIcon = (s) => s.replace(/^✦\s*/u, "");

function summary(text, max = 155) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

const COMMON = {
  ro: {
    "tp.crumb.home": "Acasă",
    "tp.crumb.teachers": "Profesori",
    "tp.back": "← Înapoi la profesori",
    "tp.gallery": "Galerie foto",
    "tp.cta.title": "Vrei să înveți cu acest profesor?",
    "tp.cta.text": "Rezervă o ședință introductivă și discutăm împreună obiectivele tale, nivelul actual și planul de studiu.",
    "tp.cta.btn": "🎵 Rezervă o Ședință",
    "tp.share.btn": "Distribuie profilul",
    "tp.share.done": "✓ Link copiat!",
    "tp.others.title": "Alți profesori",
    "tp.view.page": "Vezi pagina profesorului →",
    "tp.footer.legal": "Politica de Confidențialitate",
  },
  en: {
    "tp.crumb.home": "Home",
    "tp.crumb.teachers": "Teachers",
    "tp.back": "← Back to teachers",
    "tp.gallery": "Photo gallery",
    "tp.cta.title": "Want to learn with this teacher?",
    "tp.cta.text": "Book an introductory session and we will discuss together your goals, your current level and your study plan.",
    "tp.cta.btn": "🎵 Book a Session",
    "tp.share.btn": "Share this profile",
    "tp.share.done": "✓ Link copied!",
    "tp.others.title": "Other teachers",
    "tp.view.page": "View teacher's page →",
    "tp.footer.legal": "Privacy Policy",
  },
};

function langSwitcher() {
  return `<div class="lang-switcher" role="group" aria-label="Selectează limba">
          <button class="lang-btn lang-btn--active" data-lang="ro" aria-pressed="true">
            <span class="lang-flag">🇷🇴</span><span class="lang-code" data-i18n="lang.ro">RO</span>
          </button>
          <span class="lang-divider" aria-hidden="true">|</span>
          <button class="lang-btn" data-lang="en" aria-pressed="false">
            <span class="lang-flag">🇬🇧</span><span class="lang-code" data-i18n="lang.en">EN</span>
          </button>
        </div>`;
}

const NAV_LINKS = [
  ["/#cursuri", "nav.cursuri", "Cursuri"],
  ["/#profesori", "nav.profesori", "Profesori"],
  ["/#despre-noi", "nav.despre", "Despre noi"],
  ["/#recenzii", "nav.recenzii", "Recenzii"],
  ["/#contact", "nav.contact", "Contact"],
  ["/articole/", "nav.articole", "Articole"],
];

function header() {
  const links = NAV_LINKS.map(([href, key, label]) => `<li><a href="${href}" data-i18n="${key}">${label}</a></li>`).join("\n            ");
  const mobileLinks = NAV_LINKS.map(([href, key, label]) => `<li><a href="${href}" data-i18n="${key}">${label}</a></li>`).join("\n          ");
  return `<header class="site-header" role="banner">
      <nav class="nav container" aria-label="Navigare principală">
        <a href="/" class="nav__logo" aria-label="Nova Music Academy — Acasă">
          <img class="nav__logo-img nav__logo-img--dark" src="../../assets/images/logo-icon.png" alt="Nova Music Academy" width="36" height="36" />
          <img class="nav__logo-img nav__logo-img--light" src="../../assets/images/logo-white.png" alt="" width="36" height="36" />
          <span class="nav__logo-text">Nova Music <em>Academy</em></span>
        </a>
        <ul class="nav__links" role="list">
            ${links}
        </ul>
        ${langSwitcher()}
        <a href="${PORTAL}" class="btn btn--sm nav__login" data-i18n="nav.login">Login</a>
        <a href="${PORTAL}" class="btn btn--primary nav__cta" target="_blank" rel="noopener" data-i18n="nav.cta">Programează-te</a>
        <button class="nav__burger" aria-label="Deschide meniu" aria-expanded="false" aria-controls="mobile-menu">
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
        <ul role="list">
          ${mobileLinks}
          <li><a class="mobile-menu__login" href="${PORTAL}" data-i18n="nav.login">Login</a></li>
        </ul>
        <a href="${PORTAL}" class="btn btn--primary" target="_blank" rel="noopener" data-i18n="nav.cta">Programează-te</a>
      </div>
    </header>`;
}

const PAGE_CSS = `
      .teacher-page main { padding-top: 6rem; }
      .teacher-crumbs { max-width: 1100px; margin: 0 auto; padding: 0 1.25rem; font-size: 0.85rem; color: #666; }
      .teacher-crumbs a { color: var(--color-accent); text-decoration: none; }
      .teacher-hero { display: grid; gap: 2rem; align-items: center; max-width: 1100px; margin: 0 auto; padding: 1rem 1.25rem 1.5rem; }
      @media (min-width: 800px) { .teacher-hero { grid-template-columns: 420px 1fr; padding: 1.5rem 1.5rem 2rem; } }
      .teacher-hero__photo img { width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 20px; display: block; box-shadow: 0 12px 40px rgba(26,26,46,0.15); }
      .teacher-hero .pre-header { font-family: 'Caveat', cursive; font-size: 1.3rem; color: var(--color-accent); margin: 0; }
      .teacher-hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 900; line-height: 1.1; color: var(--color-base); margin: 0.25rem 0 1.25rem; }
      .teacher-hero .btn { margin-top: 0.5rem; }
      .teacher-bio__inner { max-width: 760px; margin: 0 auto; padding: 1rem 1.25rem 1.5rem; }
      .teacher-bio p, .teacher-bio blockquote { font-size: 1.02rem; line-height: 1.75; color: #333; margin: 0 0 1.1rem; }
      .teacher-bio blockquote { border-left: 4px solid var(--color-accent); padding: 0.75rem 1.25rem; background: var(--color-surface); border-radius: 0 12px 12px 0; font-style: italic; }
      .teacher-gallery { max-width: 1100px; margin: 0 auto; padding: 0.5rem 1.25rem 2rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; }
      .teacher-gallery img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 12px; display: block; }
      .teacher-cta { max-width: 900px; margin: 1rem auto 2rem; padding: 2rem 1.5rem; background: var(--color-base); color: #fff; border-radius: 20px; text-align: center; }
      .teacher-cta h2 { font-family: 'Playfair Display', serif; color: #fff; margin: 0 0 0.5rem; font-size: clamp(1.4rem, 3vw, 1.8rem); }
      .teacher-cta p { color: rgba(255,255,255,0.8); margin: 0 0 1.25rem; }
      .teacher-cta .btn { margin: 0.25rem; }
      .teacher-others { max-width: 1100px; margin: 0 auto; padding: 1rem 1.25rem 3rem; }
      .teacher-others h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--color-base); margin: 0 0 1rem; }
      .teacher-others__list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
      .teacher-others__list a { display: block; text-decoration: none; color: var(--color-base); background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(26,26,46,0.08); }
      .teacher-others__list img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
      .teacher-others__list .n { display: block; font-weight: 700; padding: 0.6rem 0.75rem 0; }
      .teacher-others__list .s { display: block; font-size: 0.8rem; color: #666; padding: 0.15rem 0.75rem 0.75rem; }
      .teacher-footer { background: var(--color-base); color: rgba(255,255,255,0.6); text-align: center; padding: 2rem 1.25rem; font-size: 0.85rem; }
      .teacher-footer a { color: var(--color-highlight); text-decoration: none; }`;

const SHARE_JS = `
    (function () {
      var b = document.querySelector('.teacher-share');
      if (!b) return;
      b.addEventListener('click', function () {
        var url = b.getAttribute('data-share-url');
        var title = document.title;
        var label = b.textContent;
        function done() {
          b.textContent = window.NMA_t ? NMA_t('tp.share.done') : '✓';
          setTimeout(function () { b.textContent = label; }, 2000);
        }
        if (navigator.share) {
          navigator.share({ title: title, url: url }).catch(function () {});
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () {});
        } else {
          var t = document.createElement('textarea');
          t.value = url;
          document.body.appendChild(t);
          t.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          t.remove();
        }
      });
    })();`;

function page(slug, t, ro, en, all) {
  const name = t.name;
  const photos = t.photos.map((p) => "../../" + p);
  const specRo = stripIcon(ro[t.specialty] || "");
  const specEn = stripIcon(en[t.specialty] || "");
  const firstRo = ro[t.bio[0]] || "";
  const canonical = `${SITE}/profesori/${slug}/`;
  const imgAbs = `${SITE}/${t.photos[0]}`;
  const title = `${name} — ${specRo} | Nova Music Academy`;
  const desc = summary(firstRo);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: specRo,
    description: desc,
    image: imgAbs,
    url: canonical,
    worksFor: { "@type": "EducationalOrganization", name: "Nova Music Academy", url: SITE },
  };

  const bio = t.bio
    .map((k) => {
      if (typeof k === "string") {
        return `<p data-i18n="${k}" data-i18n-html="${k}">${plain(ro[k] || "")}</p>`;
      }
      return `<blockquote data-i18n="${k.quote}" data-i18n-html="${k.quote}">${plain(ro[k.quote] || "")}</blockquote>`;
    })
    .join("\n        ");

  const gallery =
    photos.length > 1
      ? `<section class="teacher-gallery" aria-label="${esc(COMMON.ro["tp.gallery"])}">
        ${photos
          .map(
            (src, i) =>
              `<img src="${src}" alt="${esc(name)} — foto ${i + 1}" data-i18n-alt="tp.${slug}.photo.${i + 1}" loading="lazy" width="400" height="400" />`,
          )
          .join("\n        ")}
      </section>`
      : "";

  const others = Object.keys(all)
    .filter((k) => k !== slug)
    .map((k) => {
      const o = all[k];
      return `<li><a href="/profesori/${k}/">
            <img src="../../${o.photos[0]}" alt="${esc(o.name)}" loading="lazy" width="300" height="300" />
            <span class="n">${esc(o.name)}</span>
            <span class="s" data-i18n="${o.specialty}">${plain(stripIcon(ro[o.specialty] || ""))}</span>
          </a></li>`;
    })
    .join("\n          ");

  const photoPos = t.photoPosition ? ` style="object-position: ${t.photoPosition}"` : "";

  return `<!doctype html>
<html lang="ro">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title data-i18n-title="tp.${slug}.title">${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" data-i18n-content="tp.${slug}.desc" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content="${esc(title)}" data-i18n-content="tp.${slug}.title" />
    <meta property="og:description" content="${esc(desc)}" data-i18n-content="tp.${slug}.desc" />
    <meta property="og:image" content="${imgAbs}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
    </script>

    <link rel="icon" href="../../assets/images/logo-icon.png" type="image/png" />

    <!-- Meta Pixel Code -->
    <script>
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", "${PIXEL_ID}");
      fbq("track", "PageView");
    </script>
    <noscript><img height="1" width="1" style="display: none" src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" /></noscript>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../css/styles.css?v=7" />
    <style>${PAGE_CSS}
    </style>
  </head>
  <body class="teacher-page">
    ${header()}

    <main>
      <nav class="teacher-crumbs" aria-label="Breadcrumb">
        <a href="/" data-i18n="tp.crumb.home">Acasă</a> /
        <a href="/#profesori" data-i18n="tp.crumb.teachers">Profesori</a> /
        <span>${esc(name)}</span>
      </nav>

      <section class="teacher-hero" aria-labelledby="teacher-name">
        <div class="teacher-hero__photo">
          <img src="${photos[0]}" alt="${esc(name)}"${photoPos} width="840" height="1050" />
        </div>
        <div class="teacher-hero__info">
          <p class="pre-header" data-i18n="teacher.${slug}.specialty">✦ ${esc(specRo)}</p>
          <h1 id="teacher-name">${esc(name)}</h1>
          <a href="${PORTAL}" class="btn btn--primary btn--large btn--glow" target="_blank" rel="noopener" data-i18n="tp.cta.btn">🎵 Rezervă o Ședință</a>
          <button type="button" class="btn btn--outline teacher-share" data-share-url="${canonical}" data-i18n="tp.share.btn">Distribuie profilul</button>
        </div>
      </section>

      <section class="teacher-bio" aria-label="Biografie">
        <div class="teacher-bio__inner">
        ${bio}
        </div>
      </section>

      ${gallery}

      <section class="teacher-cta" aria-labelledby="teacher-cta-title">
        <h2 id="teacher-cta-title" data-i18n="tp.cta.title">Vrei să înveți cu acest profesor?</h2>
        <p data-i18n="tp.cta.text">Rezervă o ședință introductivă și discutăm împreună obiectivele tale, nivelul actual și planul de studiu.</p>
        <a href="${PORTAL}" class="btn btn--primary btn--large btn--glow" target="_blank" rel="noopener" data-i18n="tp.cta.btn">🎵 Rezervă o Ședință</a>
      </section>

      <section class="teacher-others" aria-labelledby="others-title">
        <h2 id="others-title" data-i18n="tp.others.title">Alți profesori</h2>
        <ul class="teacher-others__list" role="list">
          ${others}
        </ul>
      </section>

      <p style="text-align:center;padding-bottom:2rem;"><a href="/#profesori" data-i18n="tp.back" style="color:var(--color-accent);font-weight:600;">← Înapoi la profesori</a></p>
    </main>

    <footer class="teacher-footer" role="contentinfo">
      <p data-i18n="footer.copy">© 2026 Nova Music Academy. Toate drepturile rezervate.</p>
      <p><a href="/politica-confidentialitate/" data-i18n="tp.footer.legal">Politica de Confidențialitate</a></p>
    </footer>

    <script src="../../js/translations.js" defer></script>
    <script src="../../js/translations-app.js" defer></script>
    <script src="../../js/translations-teachers.js" defer></script>
    <script src="../../js/i18n.js" defer></script>
    <script src="../../js/main.js?v=7" defer></script>
    <script>${SHARE_JS}
    </script>
  </body>
</html>
`;
}

function main() {
  const ro0 = loadDictionaries();
  const teachers = loadTeachers();
  const slugs = Object.keys(teachers);
  const ro = ro0.ro;
  const en = ro0.en;

  const tp = { ro: { ...COMMON.ro }, en: { ...COMMON.en } };

  for (const slug of slugs) {
    const t = teachers[slug];
    const specRo = stripIcon(ro[t.specialty] || "");
    const specEn = stripIcon(en[t.specialty] || "");
    tp.ro[`tp.${slug}.title`] = `${t.name} — ${specRo} | Nova Music Academy`;
    tp.en[`tp.${slug}.title`] = `${t.name} — ${specEn} | Nova Music Academy`;
    tp.ro[`tp.${slug}.desc`] = summary(ro[t.bio[0]] || "");
    tp.en[`tp.${slug}.desc`] = summary(en[t.bio[0]] || "");
    t.photos.forEach((_, i) => {
      tp.ro[`tp.${slug}.photo.${i + 1}`] = `${t.name} — foto ${i + 1}`;
      tp.en[`tp.${slug}.photo.${i + 1}`] = `${t.name} — photo ${i + 1}`;
    });
  }

  for (const slug of slugs) {
    const dir = path.join(ROOT, "profesori", slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), page(slug, teachers[slug], ro, en, teachers));
    console.log("generat", path.relative(path.join(__dirname, ".."), path.join(dir, "index.html")));
  }

  const dictFile = `/* ── NOVA MUSIC ACADEMY — Traduceri pagini profesori ──────────
 * Generat de tools/build-teachers.js — nu edita manual.
 */
(function () {
  var T = window.NMA_TRANSLATIONS = window.NMA_TRANSLATIONS || { ro: {}, en: {} };
  Object.assign(T.ro, ${JSON.stringify(tp.ro, null, 2)});
  Object.assign(T.en, ${JSON.stringify(tp.en, null, 2)});
})();
`;
  fs.writeFileSync(path.join(ROOT, "js", "translations-teachers.js"), dictFile);
  console.log("generat src/js/translations-teachers.js");
}

main();
