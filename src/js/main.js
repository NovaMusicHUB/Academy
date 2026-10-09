/* Toate butoanele de rezervare / programare duc în portal: elevul își face
   cont (sau intră în cont) și de acolo își alege disciplina, profesorul și ora.
   Contactul (telefon, WhatsApp, email) rămâne neschimbat. */
const PORTAL_SIGNUP = "https://portal.novamusicacademy.ro/?cont=nou";
function goToPortal() {
  window.location.href = PORTAL_SIGNUP;
}

/* Textele generate din JS se citesc din dicționarul i18n la momentul randării
   (nu la încărcarea scriptului). {variabila} este înlocuită din `vars`. */
function tr(key, vars) {
  const text = typeof window.NMA_t === "function" ? window.NMA_t(key) : key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? vars[name] : match,
  );
}

/* ================================================================
   NOVA MUSIC ACADEMY — MAIN JAVASCRIPT
   Version: 1.0 | March 2026
   ================================================================ */

"use strict";

/* ── 1. HEADER: Scroll Behavior ────────────────────────────── */
(function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 60);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // Run on load
})();

/* ── 2. MOBILE MENU ─────────────────────────────────────────── */
(function initMobileMenu() {
  const burger = document.querySelector(".nav__burger");
  const menu = document.querySelector(".mobile-menu");
  if (!burger || !menu) return;

  let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
    burger.setAttribute("aria-expanded", String(isOpen));
    menu.setAttribute("aria-hidden", String(!isOpen));
    menu.classList.toggle("is-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  };

  burger.addEventListener("click", toggle);

  // Close on menu link click
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (isOpen) toggle();
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) toggle();
  });
})();

/* ── 3. LAZY VIDEO LOAD ──────────────────────────────────────── */
(function initHeroVideo() {
  const video = document.querySelector(".hero__video");
  if (!video) return;

  // Respect reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const load = () => {
    const sources = video.querySelectorAll("source[data-src]");
    sources.forEach((s) => {
      s.src = s.dataset.src;
    });

    if (video.dataset.src) {
      video.src = video.dataset.src;
    }

    video.load();
    video.play().catch(() => {
      // Autoplay blocked — poster image remains visible
    });

    video.addEventListener(
      "canplay",
      () => {
        video.classList.add("is-loaded");
      },
      { once: true },
    );
  };

  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          load();
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(video);
  } else {
    // Fallback for older browsers
    load();
  }
})();

/* ── 4. INTENT SELECTOR ──────────────────────────────────────── */
(function initIntentSelector() {
  const buttons = document.querySelectorAll(".intent-btn");
  const grid = document.getElementById("instruments-grid");
  if (!buttons.length) return;

  // Read initial intent from URL
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("who");
  if (initial) {
    const target = document.querySelector(`[data-intent="${initial}"]`);
    if (target) activateIntent(target);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => activateIntent(btn));
  });

  function activateIntent(activeBtn) {
    const intent = activeBtn.dataset.intent;

    // Update button states
    buttons.forEach((b) => {
      b.classList.remove("intent-btn--active");
      b.setAttribute("aria-pressed", "false");
    });
    activeBtn.classList.add("intent-btn--active");
    activeBtn.setAttribute("aria-pressed", "true");

    // Filter instrument cards
    if (grid) {
      const cards = grid.querySelectorAll(".instrument-card");
      cards.forEach((card) => {
        const targets = card.dataset.for ? card.dataset.for.split(" ") : [];
        const visible = intent === "all" || targets.includes(intent);
        card.setAttribute("aria-hidden", String(!visible));
      });
    }

    // Update URL for analytics (no page reload)
    const url = new URL(window.location.href);
    url.searchParams.set("who", intent);
    history.replaceState(null, "", url.toString());

    // Dispatch event for other modules
    document.dispatchEvent(
      new CustomEvent("nma:intent", { detail: { intent } }),
    );
  }
})();

/* ── 5. TESTIMONIAL TABS ─────────────────────────────────────── */
(function initTestimonialTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const cards = document.querySelectorAll(".testimonial-card");
  if (!tabs.length || !cards.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.tab;

      // Update tab states
      tabs.forEach((t) => {
        t.classList.remove("tab-btn--active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("tab-btn--active");
      tab.setAttribute("aria-selected", "true");

      // Filter cards
      cards.forEach((card) => {
        const category = card.dataset.category;
        const visible = filter === "all" || category === filter;
        card.setAttribute("aria-hidden", String(!visible));
      });
    });
  });
})();

/* ── 7. GROUP CLASSES ANNOUNCEMENT POPUP ────────────────────── */
(function initGroupAnnounce() {
  const overlay = document.getElementById("group-announce");
  if (!overlay) return;

  const closeBtn = document.getElementById("announce-close");
  const skipBtn = document.getElementById("announce-skip");
  const ctaBtn = document.getElementById("announce-cta");

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Apare dupa 10 secunde
  setTimeout(() => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }, 10000);

  closeBtn.addEventListener("click", close);
  skipBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });

  // CTA — e <a> cu href catre portal, inchidem doar popup-ul
  if (ctaBtn) ctaBtn.addEventListener("click", close);
})();

/* ── 8. TEACHER MODAL ────────────────────────────────────────── */
(function initTeacherModal() {
  const overlay = document.getElementById("teacher-modal");
  if (!overlay) return;

  const mainPhoto = document.getElementById("teacher-modal-photo");
  const thumbsEl = document.getElementById("teacher-modal-thumbs");
  const specialtyEl = document.getElementById("teacher-modal-specialty");
  const nameEl = document.getElementById("teacher-modal-name");
  const bioEl = document.getElementById("teacher-modal-bio");
  const closeBtn = overlay.querySelector(".modal__close");

  const base = "assets/images/Content%20Profesori/";

  // Specialitatea și biografia sunt chei din translations-app.js (traduse la randare)
  const data = {
    "jessica-diana": {
      name: "Jessica Diana",
      specialty: "teacher.jessica-diana.specialty",
      photos: [base + "Jessica%20Diana.jpg", base + "Jessica%20Diana%203.jpg"],
      bio: [
        "teacher.jessica-diana.bio.0",
        "teacher.jessica-diana.bio.1",
        "teacher.jessica-diana.bio.2",
      ],
    },
    "daniela-bazac": {
      name: "Dana Bazac",
      specialty: "teacher.daniela-bazac.specialty",
      photos: [
        "assets/images/Dana%201.jpeg",
        "assets/images/Dana%202.jpeg",
        "assets/images/Dana%203.jpeg",
      ],
      bio: [
        "teacher.daniela-bazac.bio.0",
        "teacher.daniela-bazac.bio.1",
        "teacher.daniela-bazac.bio.2",
        "teacher.daniela-bazac.bio.3",
      ],
    },
    "matei-alexandru": {
      name: "Matei Alexandru",
      specialty: "teacher.matei-alexandru.specialty",
      photos: [
        base + "Matei%20Alexandru.jpg",
        base + "Matei%20Alexandru%202.jpg",
      ],
      bio: [
        "teacher.matei-alexandru.bio.0",
        "teacher.matei-alexandru.bio.1",
        quote("teacher.matei-alexandru.bio.2"),
      ],
    },
    "daniel-iudean": {
      name: "Daniel Iudean",
      specialty: "teacher.daniel-iudean.specialty",
      photos: [
        base + "Daniel%20Iudean%20-%20poza%201.JPG",
        base + "Daniel%20Iudean%20-%20poza%202.JPG",
        base + "Daniel%20Iudean%20-%20poza%203.JPG",
      ],
      bio: [
        "teacher.daniel-iudean.bio.0",
        "teacher.daniel-iudean.bio.1",
        "teacher.daniel-iudean.bio.2",
        "teacher.daniel-iudean.bio.3",
      ],
    },
    "stefan-laurentiu": {
      name: "Ștefan Laurențiu",
      specialty: "teacher.stefan-laurentiu.specialty",
      photos: [base + "Stefan%20Laurentiu.jpg"],
      bio: [
        "teacher.stefan-laurentiu.bio.0",
        "teacher.stefan-laurentiu.bio.1",
        "teacher.stefan-laurentiu.bio.2",
      ],
    },
    "antonia-ivascu": {
      name: "Antonia Ivașcu",
      specialty: "teacher.antonia-ivascu.specialty",
      photos: [
        base + "Antonia%20Ivascu.jpg",
        base + "Antonia%20Ivascu%202.jpg",
        base + "Antonia%20Ivascu%203.jpg",
      ],
      bio: [
        "teacher.antonia-ivascu.bio.0",
        "teacher.antonia-ivascu.bio.1",
        "teacher.antonia-ivascu.bio.2",
      ],
    },
    "mihail-tirica": {
      name: "Mihail Tirica",
      specialty: "teacher.mihail-tirica.specialty",
      photoPosition: "top center",
      photos: [
        base + "Mihail%20Tiri%20-%20poza%201.jpg",
        base + "Mihail%20Tiri%20-%20poza%202.jpg",
        base + "Mihail%20Tiri%20-%20poza%203.jpg",
      ],
      bio: ["teacher.mihail-tirica.bio.0", "teacher.mihail-tirica.bio.1"],
    },
    "feli-dilbea": {
      name: "Feli Dilbea",
      specialty: "teacher.feli-dilbea.specialty",
      photos: [
        "assets/images/Feli.jpeg",
        "assets/images/Feli%202.jpeg",
        "assets/images/Feli%203.jpeg",
      ],
      bio: [
        "teacher.feli-dilbea.bio.0",
        "teacher.feli-dilbea.bio.1",
        "teacher.feli-dilbea.bio.2",
        "teacher.feli-dilbea.bio.3",
      ],
    },
    "bubuci-nelu": {
      name: "Bubuci Nelu",
      specialty: "teacher.bubuci-nelu.specialty",
      photos: ["assets/images/Nelu.jpeg"],
      bio: [
        "teacher.bubuci-nelu.bio.0",
        "teacher.bubuci-nelu.bio.1",
        "teacher.bubuci-nelu.bio.2",
        "teacher.bubuci-nelu.bio.3",
      ],
    },
  };

  // Paragraf marcat ca citat: se randează ca <blockquote> în loc de <p>
  function quote(key) {
    return { quote: key };
  }

  let activeTeacher = null;
  let photoIndex = 0;

  function render(key) {
    const teacher = data[key];
    if (!teacher) return;

    specialtyEl.textContent = tr(teacher.specialty);
    nameEl.textContent = teacher.name;

    bioEl.innerHTML = teacher.bio
      .map((p) =>
        typeof p === "string"
          ? `<p>${tr(p)}</p>`
          : `<blockquote>${tr(p.quote)}</blockquote>`,
      )
      .join("");

    mainPhoto.src = teacher.photos[photoIndex];
    mainPhoto.alt = teacher.name;
    mainPhoto.style.objectPosition = teacher.photoPosition || "top center";

    thumbsEl.innerHTML = "";
    if (teacher.photos.length > 1) {
      teacher.photos.forEach((src, i) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = tr("teacher.photo", { name: teacher.name, n: i + 1 });
        img.className =
          "teacher-modal__thumb" + (i === photoIndex ? " is-active" : "");
        img.loading = "lazy";
        img.addEventListener("click", () => {
          photoIndex = i;
          mainPhoto.src = src;
          thumbsEl
            .querySelectorAll(".teacher-modal__thumb")
            .forEach((t) => t.classList.remove("is-active"));
          img.classList.add("is-active");
        });
        thumbsEl.appendChild(img);
      });
    }
  }

  function open(key) {
    if (!data[key]) return;

    activeTeacher = key;
    photoIndex = 0;
    render(key);

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Re-randare cu limba nouă dacă modalul e deschis
  document.addEventListener("nma:langchange", () => {
    if (activeTeacher && overlay.classList.contains("is-open")) {
      render(activeTeacher);
    }
  });

  document.querySelectorAll(".teacher-card[data-teacher]").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => open(card.dataset.teacher));
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
})();

/* ── 8. EVENTS GALLERY + LIGHTBOX ───────────────────────────── */
(function initGallery() {
  const tabs = document.querySelectorAll("[data-gallery]");
  const grids = {
    craciun: document.getElementById("gallery-craciun"),
    vara: document.getElementById("gallery-vara"),
  };
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const lbImg = lightbox.querySelector(".lightbox__img");
  const lbClose = lightbox.querySelector(".lightbox__close");
  const lbPrev = lightbox.querySelector(".lightbox__prev");
  const lbNext = lightbox.querySelector(".lightbox__next");

  let currentItems = [];
  let currentIndex = 0;
  let currentEvent = "";

  // ── Tab switching ──
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("tab-btn--active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("tab-btn--active");
      tab.setAttribute("aria-selected", "true");

      Object.values(grids).forEach(
        (g) => g && g.classList.add("gallery__grid--hidden"),
      );
      const target = grids[tab.dataset.gallery];
      if (target) target.classList.remove("gallery__grid--hidden");
    });
  });

  // ── Lightbox open ──
  document.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", () => {
      const event = item.dataset.event;
      const idx = parseInt(item.dataset.index, 10);
      const grid = grids[event];
      currentEvent = event;
      currentItems = grid
        ? Array.from(grid.querySelectorAll(".gallery__item img"))
        : [];
      currentIndex = idx;
      showImage(currentIndex);
      openLightbox();
    });
  });

  function showImage(i) {
    const img = currentItems[i];
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = tr("event." + currentEvent);
    currentIndex = i;
  }

  function openLightbox() {
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.src = "";
  }

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  lbPrev.addEventListener("click", () =>
    showImage((currentIndex - 1 + currentItems.length) % currentItems.length),
  );
  lbNext.addEventListener("click", () =>
    showImage((currentIndex + 1) % currentItems.length),
  );

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft")
      showImage((currentIndex - 1 + currentItems.length) % currentItems.length);
    if (e.key === "ArrowRight")
      showImage((currentIndex + 1) % currentItems.length);
  });

  // Alt-ul imaginii din lightbox se actualizează dacă limba se schimbă cât timp e deschis
  document.addEventListener("nma:langchange", () => {
    if (lightbox.classList.contains("is-open")) showImage(currentIndex);
  });
})();

/* ── 8. RESOURCE MODAL ───────────────────────────────────────── */
(function initResourceModal() {
  const overlay = document.getElementById("resource-modal");
  if (!overlay) return;

  const titleEl = document.getElementById("resource-modal-title");
  const bodyEl = document.getElementById("resource-modal-body");
  const closeBtn = overlay.querySelector(".modal__close");

  const range = (n) => Array.from({ length: n }, (_, i) => i);

  // Articolele sunt funcții: conținutul se generează la fiecare randare, în limba curentă
  const articles = {
    "article-1": () => `
      <div class="resource-article">
        <p class="resource-article__intro">${tr("res.a1.intro")}</p>
        <ol class="resource-article__list">
          ${range(10)
            .map(
              (i) =>
                `<li><strong>${tr(`res.a1.li.${i}.title`)}</strong><br>${tr(`res.a1.li.${i}.text`)}</li>`,
            )
            .join("")}
        </ol>
        <h3>${tr("res.a1.h3")}</h3>
        <p>${tr("res.a1.followup")}</p>
        <ul class="resource-article__tips">
          ${range(5)
            .map((i) => `<li>${tr(`res.a1.tip.${i}`)}</li>`)
            .join("")}
        </ul>
        <div class="resource-article__cta">
          <p>🎵 <strong>${tr("res.a1.cta.title")}</strong></p>
          <p>${tr("res.a1.cta.text")}</p>
          <button type="button" class="btn btn--primary" data-modal="registration-modal">${tr("res.a1.cta.btn")}</button>
        </div>
        <p class="resource-article__footer">${tr("res.a1.footer")}</p>
      </div>`,
  };

  // Titlurile din index.html (data-title) sunt în română; traducerea se ia după data-resource
  const RESOURCE_TITLE_KEYS = {
    "article-1": "res.title.article-1",
    "assets/Content%20Resurse/Teorie%20muzicala/Notiuni%20generale%20de%20teorie%20muzicala.pdf":
      "res.title.teorie-generale",
    "assets/Content%20Resurse/Teorie%20muzicala/ritmica%20si%20metrica.pdf":
      "res.title.ritmica",
  };

  const titleOf = (card) => {
    const key = RESOURCE_TITLE_KEYS[card.dataset.resource];
    return key ? tr(key) : card.dataset.title;
  };

  let activeCard = null;

  const render = (card) => {
    const src = card.dataset.resource;
    const type = card.dataset.type;
    const title = titleOf(card);

    titleEl.textContent = title;

    if (type === "article") {
      bodyEl.innerHTML = articles[src]
        ? articles[src]()
        : `<p>${tr("res.unavailable")}</p>`;
    } else if (type === "pdf") {
      bodyEl.innerHTML = `<iframe src="${src}" title="${title}"></iframe>`;
    } else {
      bodyEl.innerHTML = `
        <div class="resource-modal__download">
          <span style="font-size:3rem">📄</span>
          <p>${tr("res.pdf.note")}</p>
          <a href="${src}" download class="btn btn--primary btn--large">${tr("res.pdf.download")}</a>
        </div>`;
    }
  };

  const open = (card) => {
    activeCard = card;
    render(card);

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    bodyEl.innerHTML = "";
    activeCard = null;
  };

  // Re-randare cu limba nouă dacă modalul e deschis
  document.addEventListener("nma:langchange", () => {
    if (activeCard && overlay.classList.contains("is-open")) render(activeCard);
  });

  document.querySelectorAll(".resource-card").forEach((card) => {
    card.addEventListener("click", () => open(card));
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });
})();

/* ── 9. FAQ ACCORDION ─────────────────────────────────────────── */
(function initFAQ() {
  const list = document.getElementById("faq-list");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq__question");
    if (!btn) return;

    const isOpen = btn.getAttribute("aria-expanded") === "true";
    const answer = btn.nextElementSibling;

    // Close all others
    list
      .querySelectorAll('.faq__question[aria-expanded="true"]')
      .forEach((other) => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          other.nextElementSibling.hidden = true;
        }
      });

    btn.setAttribute("aria-expanded", String(!isOpen));
    answer.hidden = isOpen;
  });
})();

/* ── 8. REGISTRATION MODAL ───────────────────────────────────── */
(function initRegistrationModal() {
  const overlay = document.getElementById("registration-modal");
  if (!overlay) return;

  const modal = overlay.querySelector(".modal");
  const closeBtn = overlay.querySelector(".modal__close");
  const form = overlay.querySelector("#registration-form");
  const firstInput = overlay.querySelector("input, select, textarea");

  const open = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  };

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  // Open on any [data-modal="registration-modal"] trigger
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest('[data-modal="registration-modal"]');
    if (trigger) {
      e.preventDefault();
      goToPortal();
    }
  });

  // Close on X button
  if (closeBtn) closeBtn.addEventListener("click", close);

  // Close on overlay backdrop click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });

  // Form submission
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = tr("form.sending");

      // course = valoarea select-ului (slug, ex. "canto-cvt"): se trimite identic în
      // ambele limbi, ca echipa să primească aceleași date indiferent de limba formularului
      const data = {
        name: form.querySelector("#reg-name")?.value,
        phone: form.querySelector("#reg-phone")?.value,
        email: form.querySelector("#reg-email")?.value,
        dob: form.querySelector("#reg-dob")?.value,
        sex: form.querySelector("#reg-sex")?.value,
        course: form.querySelector("#reg-course")?.value,
        source: form.querySelector("#reg-source")?.value,
        goal: form.querySelector("#reg-goal")?.value,
        gdpr: form.querySelector('[name="gdpr"]')?.checked,
        contactConsent: form.querySelector('[name="contact_consent"]')?.checked,
      };

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: "11b8704d-07a0-4ca0-9626-51a07d3c1a78",
            subject: "Cerere Evaluare Gratuită — Nova Music Academy",
            from_name: "Nova Music Academy — Website",
            "Nume și Prenume": data.name,
            Telefon: data.phone,
            Email: data.email,
            "Data Nașterii": data.dob,
            "Curs dorit": data.course,
            Sursa: data.source,
            "Obiectiv muzical": data.goal,
            "Acord GDPR": data.gdpr ? "Da" : "Nu",
            "Acord contactare": data.contactConsent ? "Da" : "Nu",
          }),
        });

        const result = await res.json();

        if (result.success) {
          // Fire Meta Pixel Lead event on successful form submission
          if (typeof fbq === "function") fbq("track", "Lead");

          submitBtn.innerHTML = tr("form.success");
          form.reset();
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            close();
          }, 2500);
        } else {
          throw new Error("Web3Forms error");
        }
      } catch {
        // Fallback — WhatsApp
        const msg = data.course
          ? tr("wa.msg.course", {
              course: data.course,
              name: data.name,
              phone: data.phone,
            })
          : tr("wa.msg.plain", { name: data.name, phone: data.phone });
        window.open(
          `https://wa.me/40771089525?text=${encodeURIComponent(msg)}`,
          "_blank",
          "noopener,noreferrer",
        );

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
})();

/* ── 8. DISCIPLINE MODAL ─────────────────────────────────────── */
(function initDisciplineModal() {
  const overlay = document.getElementById("discipline-modal");
  if (!overlay) return;

  const modal = overlay.querySelector(".modal--discipline");
  const closeBtn = overlay.querySelector(".modal__close");
  const elIcon = document.getElementById("discipline-modal-icon");
  const elBadge = document.getElementById("discipline-modal-badge");
  const elName = document.getElementById("discipline-modal-name");
  const elIntro = document.getElementById("discipline-modal-intro");
  const elPoints = document.getElementById("discipline-modal-points");
  const elMeta = document.getElementById("discipline-modal-meta");
  const ctaBtn = overlay.querySelector(".btn--primary");

  // Textele sunt chei din translations-app.js (traduse la fiecare randare)
  const disciplines = {
    "canto-cvt": {
      icon: "🎤",
      name: "disc.canto-cvt.name",
      badge: "disc.canto-cvt.badge",
      intro: "disc.canto-cvt.intro",
      points: [
        "disc.canto-cvt.point.0",
        "disc.canto-cvt.point.1",
        "disc.canto-cvt.point.2",
        "disc.canto-cvt.point.3",
        "disc.canto-cvt.point.4",
        "disc.canto-cvt.point.5",
      ],
      meta: ["meta.age.4", "meta.kids-adults", "meta.online"],
    },
    pian: {
      icon: "🎹",
      name: "disc.pian.name",
      badge: "disc.pian.badge",
      intro: "disc.pian.intro",
      points: [
        "disc.pian.point.0",
        "disc.pian.point.1",
        "disc.pian.point.2",
        "disc.pian.point.3",
        "disc.pian.point.4",
        "disc.pian.point.5",
      ],
      meta: [
        "meta.age.4",
        "meta.kids-adults",
        "meta.online",
        "meta.popular",
      ],
    },
    chitara: {
      icon: "🎸",
      name: "disc.chitara.name",
      badge: "disc.chitara.badge",
      intro: "disc.chitara.intro",
      points: [
        "disc.chitara.point.0",
        "disc.chitara.point.1",
        "disc.chitara.point.2",
        "disc.chitara.point.3",
        "disc.chitara.point.4",
        "disc.chitara.point.5",
      ],
      meta: ["meta.age.6", "meta.kids-adults", "meta.online"],
    },
    teorie: {
      icon: "🎼",
      name: "disc.teorie.name",
      badge: "disc.teorie.badge",
      intro: "disc.teorie.intro",
      points: [
        "disc.teorie.point.0",
        "disc.teorie.point.1",
        "disc.teorie.point.2",
        "disc.teorie.point.3",
        "disc.teorie.point.4",
        "disc.teorie.point.5",
      ],
      meta: ["meta.age.6", "meta.kids-adults", "meta.online"],
    },
    saxofon: {
      icon: "🎷",
      name: "disc.saxofon.name",
      badge: "disc.saxofon.badge",
      intro: "disc.saxofon.intro",
      points: [
        "disc.saxofon.point.0",
        "disc.saxofon.point.1",
        "disc.saxofon.point.2",
        "disc.saxofon.point.3",
        "disc.saxofon.point.4",
        "disc.saxofon.point.5",
      ],
      meta: ["meta.age.7", "meta.kids-adults", "meta.online"],
    },
    vioara: {
      icon: "🎻",
      name: "disc.vioara.name",
      badge: "disc.vioara.badge",
      intro: "disc.vioara.intro",
      points: [
        "disc.vioara.point.0",
        "disc.vioara.point.1",
        "disc.vioara.point.2",
        "disc.vioara.point.3",
        "disc.vioara.point.4",
        "disc.vioara.point.5",
      ],
      meta: ["meta.age.5", "meta.kids-adults"],
    },
    productie: {
      icon: "🎧",
      name: "disc.productie.name",
      badge: "disc.productie.badge",
      intro: "disc.productie.intro",
      points: [
        "disc.productie.point.0",
        "disc.productie.point.1",
        "disc.productie.point.2",
        "disc.productie.point.3",
        "disc.productie.point.4",
        "disc.productie.point.5",
      ],
      meta: ["meta.age.14", "meta.adults", "meta.online", "meta.new"],
    },
    tobe: {
      icon: "🥁",
      name: "disc.tobe.name",
      badge: "disc.tobe.badge",
      intro: "disc.tobe.intro",
      points: [
        "disc.tobe.point.0",
        "disc.tobe.point.1",
        "disc.tobe.point.2",
        "disc.tobe.point.3",
        "disc.tobe.point.4",
        "disc.tobe.point.5",
      ],
      meta: ["meta.age.5", "meta.kids-adults", "meta.online"],
    },
    dans: {
      icon: "💃",
      name: "disc.dans.name",
      badge: "disc.dans.badge",
      intro: "disc.dans.intro",
      points: [
        "disc.dans.point.0",
        "disc.dans.point.1",
        "disc.dans.point.2",
        "disc.dans.point.3",
        "disc.dans.point.4",
        "disc.dans.point.5",
      ],
      meta: ["disc.dans.meta"],
    },
  };

  let activeDiscipline = null;

  function render(key) {
    const d = disciplines[key];

    elIcon.textContent = d.icon;
    elBadge.textContent = tr(d.badge);
    elName.textContent = tr(d.name);
    elIntro.textContent = tr(d.intro);

    elPoints.innerHTML = d.points.map((p) => `<li>${tr(p)}</li>`).join("");

    elMeta.innerHTML = d.meta
      .map((m) => `<span class="badge">${tr(m)}</span>`)
      .join("");
  }

  function open(key) {
    if (!disciplines[key]) return;

    activeDiscipline = key;
    render(key);

    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    overlay.setAttribute("aria-hidden", "true");
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  // Re-randare cu limba nouă dacă modalul e deschis
  document.addEventListener("nma:langchange", () => {
    if (activeDiscipline && overlay.classList.contains("is-open")) {
      render(activeDiscipline);
    }
  });

  // Open on card button click
  document
    .querySelectorAll(".instrument-card[data-discipline]")
    .forEach((card) => {
      const btn = card.querySelector("button");
      if (btn)
        btn.addEventListener("click", () => open(card.dataset.discipline));
    });

  // Close via × button
  closeBtn.addEventListener("click", close);

  // Close on backdrop click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
  });

  // CTA inside discipline modal opens registration modal
  if (ctaBtn) {
    ctaBtn.addEventListener("click", () => {
      close();
      goToPortal();
    });
  }

  // Footer links with data-discipline scroll to section then open modal
  document.querySelectorAll("a[data-discipline]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const key = link.dataset.discipline;
      const section = document.getElementById("cursuri");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => open(key), 500);
      } else {
        open(key);
      }
    });
  });
})();

/* ── 9. SCROLL REVEAL ────────────────────────────────────────── */
(function initReveal() {
  // Elements to reveal as cards (staggered within parent)
  const cardSelectors = [
    ".instrument-card",
    ".feature-card",
    ".cvt-card",
    ".teacher-card",
    ".testimonial-card",
    ".resource-card",
    ".faq__item",
  ];

  // Elements to reveal as section headers
  const headerSelectors = [
    ".section-title",
    ".pre-header",
    ".cvt-section__lead",
    ".cvt-section__text",
    ".cvt-section__quote",
    ".cvt-section__cta",
  ];

  // Add reveal class to headers
  document.querySelectorAll(headerSelectors.join(",")).forEach((el) => {
    // Skip hero elements — they have CSS animation already
    if (el.closest(".hero")) return;
    el.classList.add("section-reveal");
  });

  // Add reveal + stagger delay to cards
  cardSelectors.forEach((sel) => {
    const groups = {};
    document.querySelectorAll(sel).forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has) groups[parent] = groups[parent] || [];
      groups[parent].push(el);
    });
    // Group siblings together for stagger
    document.querySelectorAll(sel).forEach((el) => {
      el.classList.add("reveal");
    });
    // Apply stagger per parent group
    const parents = new Set(
      Array.from(document.querySelectorAll(sel)).map((el) => el.parentElement),
    );
    parents.forEach((parent) => {
      parent.querySelectorAll(sel).forEach((el, i) => {
        el.setAttribute("data-delay", String((i % 6) + 1));
      });
    });
  });

  // Bail out if no IntersectionObserver
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal, .section-reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  document
    .querySelectorAll(".reveal, .section-reveal")
    .forEach((el) => obs.observe(el));
})();

/* ── 10. SMOOTH SCROLL for anchor links ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* ── 11. TEXTE STATICE DIN MODALE, LIGHTBOX ȘI GALERIE ─────────── */
/* Aceste elemente au text/aria/alt în index.html; le actualizăm din dicționar
   la încărcare și la fiecare schimbare de limbă. */
(function initLocalizedChrome() {
  const CHROME = [
    ["#lightbox", "aria-label", "lightbox.label"],
    [".lightbox__close", "aria-label", "common.close"],
    [".lightbox__prev", "aria-label", "lightbox.prev"],
    [".lightbox__next", "aria-label", "lightbox.next"],
    ["#discipline-modal .modal__close", "aria-label", "common.close"],
    ["#teacher-modal .modal__close", "aria-label", "common.close"],
    ["#resource-modal .modal__close", "aria-label", "res.close"],
    ["#registration-modal .modal__close", "aria-label", "reg.close"],
    [
      "#discipline-modal .discipline-modal__body h4",
      "textContent",
      "disc.learn",
    ],
    ["#discipline-modal .btn--primary", "textContent", "disc.cta"],
  ];

  function apply() {
    CHROME.forEach(([selector, prop, key]) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (prop === "textContent") {
          el.textContent = tr(key);
        } else {
          el.setAttribute(prop, tr(key));
        }
      });
    });

    document.querySelectorAll(".gallery__item").forEach((item) => {
      const img = item.querySelector("img");
      if (img) img.alt = tr("event." + item.dataset.event);
    });

    ["craciun", "vara"].forEach((event) => {
      const grid = document.getElementById("gallery-" + event);
      if (grid) grid.setAttribute("aria-label", tr("event." + event));
    });
  }

  apply();
  document.addEventListener("nma:langchange", apply);
})();
