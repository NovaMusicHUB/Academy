/* ================================================================
   NOVA MUSIC ACADEMY — MAIN JAVASCRIPT
   Version: 1.0 | March 2026
   ================================================================ */

'use strict';

/* ── 1. HEADER: Scroll Behavior ────────────────────────────── */
(function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run on load
})();


/* ── 2. MOBILE MENU ─────────────────────────────────────────── */
(function initMobileMenu() {
  const burger = document.querySelector('.nav__burger');
  const menu   = document.querySelector('.mobile-menu');
  if (!burger || !menu) return;

  let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
    burger.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
    menu.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', toggle);

  // Close on menu link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggle();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggle();
  });
})();


/* ── 3. LAZY VIDEO LOAD ──────────────────────────────────────── */
(function initHeroVideo() {
  const video = document.querySelector('.hero__video');
  if (!video) return;

  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const load = () => {
    const sources = video.querySelectorAll('source[data-src]');
    sources.forEach(s => { s.src = s.dataset.src; });

    if (video.dataset.src) {
      video.src = video.dataset.src;
    }

    video.load();
    video.play().catch(() => {
      // Autoplay blocked — poster image remains visible
    });

    video.addEventListener('canplay', () => {
      video.classList.add('is-loaded');
    }, { once: true });
  };

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          load();
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(video);
  } else {
    // Fallback for older browsers
    load();
  }
})();


/* ── 4. INTENT SELECTOR ──────────────────────────────────────── */
(function initIntentSelector() {
  const buttons = document.querySelectorAll('.intent-btn');
  const grid    = document.getElementById('instruments-grid');
  if (!buttons.length) return;

  // Read initial intent from URL
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('who');
  if (initial) {
    const target = document.querySelector(`[data-intent="${initial}"]`);
    if (target) activateIntent(target);
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => activateIntent(btn));
  });

  function activateIntent(activeBtn) {
    const intent = activeBtn.dataset.intent;

    // Update button states
    buttons.forEach(b => {
      b.classList.remove('intent-btn--active');
      b.setAttribute('aria-pressed', 'false');
    });
    activeBtn.classList.add('intent-btn--active');
    activeBtn.setAttribute('aria-pressed', 'true');

    // Filter instrument cards
    if (grid) {
      const cards = grid.querySelectorAll('.instrument-card');
      cards.forEach(card => {
        const targets = card.dataset.for ? card.dataset.for.split(' ') : [];
        const visible = intent === 'all' || targets.includes(intent);
        card.setAttribute('aria-hidden', String(!visible));
      });
    }

    // Update URL for analytics (no page reload)
    const url = new URL(window.location.href);
    url.searchParams.set('who', intent);
    history.replaceState(null, '', url.toString());

    // Dispatch event for other modules
    document.dispatchEvent(new CustomEvent('nma:intent', { detail: { intent } }));
  }
})();


/* ── 5. TESTIMONIAL TABS ─────────────────────────────────────── */
(function initTestimonialTabs() {
  const tabs  = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.testimonial-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.tab;

      // Update tab states
      tabs.forEach(t => {
        t.classList.remove('tab-btn--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('tab-btn--active');
      tab.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach(card => {
        const category = card.dataset.category;
        const visible  = filter === 'all' || category === filter;
        card.setAttribute('aria-hidden', String(!visible));
      });
    });
  });
})();


/* ── 7. TEACHER MODAL ────────────────────────────────────────── */
(function initTeacherModal() {
  const overlay  = document.getElementById('teacher-modal');
  if (!overlay) return;

  const mainPhoto  = document.getElementById('teacher-modal-photo');
  const thumbsEl   = document.getElementById('teacher-modal-thumbs');
  const specialtyEl = document.getElementById('teacher-modal-specialty');
  const nameEl     = document.getElementById('teacher-modal-name');
  const bioEl      = document.getElementById('teacher-modal-bio');
  const closeBtn   = overlay.querySelector('.modal__close');

  const base = 'assets/images/Content%20Profesori/';

  const data = {
    'jessica-diana': {
      name: 'Jessica Diana',
      specialty: '✦ Canto CVT',
      photos: [
        base + 'Jessica%20Diana.jpg',
        base + 'Jessica%20Diana%203.jpg',
      ],
      bio: [
        'Cantautoare și solistă cu peste 12 ani de experiență în industria muzicală, remarcându-se prin succesul proiectului său solo, Jessica D, în țări precum Liban, Cipru, Grecia și Spania, în colaborare cu casa de discuri Roton. Artist complet, cu expertiză în songwriting, înregistrări de studio și spectacole live.',
        'În calitate de Vocal Coach la Nova Music, Jessica combină experiența sa profesională cu o abordare psihologică profundă, ajutându-și cursanții să devină artiști compleți. Pune accent pe dezvoltarea încrederii în sine, perfecționarea tehnicii vocale și susținerea unei evoluții personale constante.',
        'Cu o metodă de predare personalizată, Jessica oferă un mediu sigur, motivațional și plin de inspirație, unde fiecare elev își poate descoperi și valorifica potențialul artistic.',
      ],
    },
    'daniela-bazac': {
      name: 'Dana Bazac',
      specialty: '✦ Pian · Vocal Coach CVT',
      photos: [
        'assets/images/Dana%201.jpeg',
        'assets/images/Dana%202.jpeg',
        'assets/images/Dana%203.jpeg',
      ],
      bio: [
        'Dana Bazac are 24 de ani și o relație profundă cu muzica, construită încă din copilărie, odată cu primele lecții de pian din clasa I. Parcursul său artistic a evoluat constant, ducând-o astăzi pe scenă, atât ca instrumentist, cât și ca vocalist.',
        'Este absolventă a Universității Naționale de Muzică din București, secția Compoziție, iar în prezent își continuă studiile la nivel de master. De-a lungul anilor, a explorat diverse tehnici vocale, iar întâlnirea cu Complete Vocal Technique (CVT) a reprezentat un moment definitoriu în dezvoltarea sa, oferindu-i o înțelegere clară și sănătoasă a vocii.',
        'Cu o experiență scenică de peste 17 ani, Dana a susținut numeroase concerte și evenimente încă din 2014, colaborând cu diverse trupe și proiecte muzicale din România.',
        'În rolul de profesor de pian și vocal coach, Dana creează un mediu sigur și încurajator pentru elevii săi, unde aceștia pot explora, experimenta și evolua în ritmul propriu. Abordarea sa îmbină rigoarea tehnică cu dezvoltarea încrederii și a expresivității, punând accent pe autenticitate — esența oricărui act artistic.',
      ],
    },
    'matei-alexandru': {
      name: 'Matei Alexandru',
      specialty: '✦ Pian · Chitară · Teorie Muzicală',
      photos: [
        base + 'Matei%20Alexandru.jpg',
        base + 'Matei%20Alexandru%202.jpg',
      ],
      bio: [
        'Vocația pentru muzică a lui Matei s-a manifestat de la cele mai mici vârste prin fascinația pentru instrumente și manifestarea muzicală a emoțiilor. La vârsta de 5 ani a început studiul pianului prin lecții particulare, iar de la 7 la 15 ani a urmat cursurile Școlii de Muzică și Arte Plastice nr. 5 din București, studiind pian, chitară, teorie muzicală și cor.',
        'De-a lungul timpului a fost laureat al unor concursuri de interpretare vocală, la chitară și la pian, și a coordonat ateliere de artă muzicală în cadrul unor proiecte educaționale. Actualmente compune și cântă în formația A Theory of Harmony.',
        quote('La ora de instrument ofer elevului nu numai cunoașterea instrumentului prin tehnici specifice pianului sau chitarei, ci și uneltele necesare pentru a înțelege muzica în întregul ei. Urmăresc ca elevul să devină un interpret cu impact și în același timp un artist profund și inteligent.'),
      ],
    },
    'daniel-iudean': {
      name: 'Daniel Iudean',
      specialty: '✦ Tobe · Percuție',
      photos: [
        base + 'Daniel%20Iudean%20-%20poza%201.JPG',
        base + 'Daniel%20Iudean%20-%20poza%202.JPG',
        base + 'Daniel%20Iudean%20-%20poza%203.JPG',
      ],
      bio: [
        'La 6 ani începe cursurile la Liceul de Artă din Târgu Mureș la secția de pian. La 10 ani, atras de instrumentele de percuție, își schimbă instrumentul și este premiat la olimpiadele de muzică regionale și naționale, remarcându-se la marimbă.',
        'La 15 ani câștigă concursul Constantin Silvestri, în urma căruia studiază un an la Stewarts Melville College din Edinburgh, Scoția. Acolo descoperă tobele moderne, studiind stiluri de rock, jazz și marching drum.',
        'Pe toată perioada liceului colaborează cu Filarmonica de Stat din Târgu Mureș. Obține licența la Universitatea Națională de Muzică din București la instrumente de percuție.',
        'Colaborări: Keo, Alexandra Ungureanu, Skizzo Skillz, Plastik Charm, Ask The Fools. Din 2011 este colaborator permanent în trupa Loredanei Groza. Profesor de tobe din 2018.',
      ],
    },
    'stefan-laurentiu': {
      name: 'Ștefan Laurențiu',
      specialty: '✦ Saxofon · Instrumente de suflat',
      photos: [
        base + 'Stefan%20Laurentiu.jpg',
      ],
      bio: [
        'Absolvent al Liceului de Muzică Sigismund Toduță Cluj; din 2006 până în 2010 a urmat studiile Academiei de Muzică Gheorghe Dima din Cluj-Napoca, licențiat în interpretare muzicală — solist instrumentist clarinet.',
        'În anii ce au urmat a abordat mai multe culturi muzicale în diferite trupe și orchestre din țară și din străinătate, ajungând să stăpânească o gamă variată de instrumente de suflat: caval, fluier, flaut, saxofon alto, saxofon tenor și saxofon sopran.',
        'Colaborări: Banda di Bracigliano (Italia), Loredana Groza, Adi Cristescu, Eugenia Nicolae, Trupa Breeze, Aylin Cadir. În prezent este saxofonist în band-ul HB (Horia Brenciu).',
      ],
    },
    'antonia-ivascu': {
      name: 'Antonia Ivașcu',
      specialty: '✦ Pian · Chitară',
      photos: [
        base + 'Antonia%20Ivascu.jpg',
        base + 'Antonia%20Ivascu%202.jpg',
        base + 'Antonia%20Ivascu%203.jpg',
      ],
      bio: [
        'Muzica a fost cea mai mare forță din viața mea încă de când eram mică. Pasiunea mea s-a manifestat într-un continuu studiu și experimentare a multor ramuri ale ei — de la cântat vocal, la instrumente, la songwriting și producție.',
        'Activitatea artistică mi-am început-o de mică, cântând pe scene mai mici sau mai mari. Mai târziu am absolvit Conservatorul din Cluj la secția pedagogie muzicală, în paralel cu Facultatea de Psihologie — cel de-al doilea domeniu de mare interes pentru mine.',
        'În prezent predau cursuri de pian și chitară și mă bucur să iau parte la drumul în muzică al fiecărui cursant cu care lucrez.',
      ],
    },
    'mihail-tirica': {
      name: 'Mihail Tirica',
      specialty: '✦ Producție Muzicală',
      photoPosition: 'top center',
      photos: [
        base + 'Mihail%20Tiri%20-%20poza%201.jpg',
        base + 'Mihail%20Tiri%20-%20poza%202.jpg',
        base + 'Mihail%20Tiri%20-%20poza%203.jpg',
      ],
      bio: [
        'Fondatorul Nova Music Academy și instructor de producție muzicală. Pasionat de muzică și tehnologie audio, ghidează cursanții prin universul DAW-urilor, beatmaking-ului, mixingului și masteringului.',
        'Crede că producția muzicală este una dintre cele mai accesibile forme de exprimare artistică modernă — și că fiecare student poate ajunge la rezultate profesionale cu metodele potrivite.',
      ],
    },
    'feli-dilbea': {
      name: 'Feli Dilbea',
      specialty: '✦ Vocal Coach · Canto CVT',
      photos: [
        'assets/images/Feli.jpeg',
        'assets/images/Feli%202.jpeg',
        'assets/images/Feli%203.jpeg',
      ],
      bio: [
        'Absolventă a Universității Naționale de Muzică din București, secția Compoziție – Muzică Ușoară, Feli aduce cu ea peste 18 ani de experiență muzicală și 6 ani de activitate activă în industrie.',
        'Ca artist singer-songwriter, explorează constant noi direcții creative, iar energia aceasta o aduce direct în sala de curs. Cu o experiență pedagogică de peste 6 ani, știe să se conecteze natural cu fiecare elev, indiferent de vârstă.',
        'Creează un spațiu în care copiii și tinerii se simt liberi să descopere muzica fără presiune, cu entuziasm și autenticitate. Pasiunea ei pentru psihologie face diferența în modul în care predă — înțelege nevoile emoționale ale elevilor și transformă fiecare lecție într-o experiență de creștere personală, nu doar muzicală.',
        'Pe scenă de la 6 ani, Feli știe că muzica nu este doar tehnică — este emoție, prezență și autenticitate. La Nova Music Academy, ea transmite exact asta: pasiunea pentru muzică și convingerea că aceasta poate transforma, conecta și inspira.',
      ],
    },
    'bubuci-nelu': {
      name: 'Bubuci Nelu',
      specialty: '✦ Vioară',
      photos: [
        'assets/images/Nelu.jpeg',
      ],
      bio: [
        'Violonist și profesor de vioară, absolvent al Universității Naționale de Muzică din București (licență și master, specializarea Stilistică interpretativă – Muzică de cameră).',
        'Parcursul său muzical a început de la o vârstă fragedă, studiind vioara și pianul la Liceul „Serghei Rahmaninov" din Chișinău, iar ulterior a activat în cadrul Filarmonicii Naționale „Serghei Lunchevici".',
        'În prezent, este membru al Orchestrei Române de Tineret și al formației „Intermezzo Cantabile", implicându-se constant în concerte și proiecte artistice.',
        'Ca profesor, se remarcă prin răbdare, claritate în explicații și o abordare echilibrată între tehnică și expresivitate, adaptându-se fiecărui elev și ghidându-l cu atenție în dezvoltarea sa muzicală.',
      ],
    },
  };

  function quote(text) { return `<blockquote>${text}</blockquote>`; }

  function open(key) {
    const teacher = data[key];
    if (!teacher) return;

    specialtyEl.textContent = teacher.specialty;
    nameEl.textContent      = teacher.name;

    bioEl.innerHTML = teacher.bio.map(p =>
      p.startsWith('<blockquote>') ? p : `<p>${p}</p>`
    ).join('');

    mainPhoto.src = teacher.photos[0];
    mainPhoto.alt = teacher.name;
    mainPhoto.style.objectPosition = teacher.photoPosition || 'top center';

    thumbsEl.innerHTML = '';
    if (teacher.photos.length > 1) {
      teacher.photos.forEach((src, i) => {
        const img = document.createElement('img');
        img.src   = src;
        img.alt   = `${teacher.name} — foto ${i + 1}`;
        img.className = 'teacher-modal__thumb' + (i === 0 ? ' is-active' : '');
        img.loading = 'lazy';
        img.addEventListener('click', () => {
          mainPhoto.src = src;
          thumbsEl.querySelectorAll('.teacher-modal__thumb').forEach(t => t.classList.remove('is-active'));
          img.classList.add('is-active');
        });
        thumbsEl.appendChild(img);
      });
    }

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.teacher-card[data-teacher]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => open(card.dataset.teacher));
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
})();


/* ── 8. EVENTS GALLERY + LIGHTBOX ───────────────────────────── */
(function initGallery() {
  const tabs     = document.querySelectorAll('[data-gallery]');
  const grids    = { craciun: document.getElementById('gallery-craciun'), vara: document.getElementById('gallery-vara') };
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg  = lightbox.querySelector('.lightbox__img');
  const lbClose = lightbox.querySelector('.lightbox__close');
  const lbPrev = lightbox.querySelector('.lightbox__prev');
  const lbNext = lightbox.querySelector('.lightbox__next');

  let currentItems = [];
  let currentIndex = 0;

  // ── Tab switching ──
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('tab-btn--active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('tab-btn--active');
      tab.setAttribute('aria-selected', 'true');

      Object.values(grids).forEach(g => g && g.classList.add('gallery__grid--hidden'));
      const target = grids[tab.dataset.gallery];
      if (target) target.classList.remove('gallery__grid--hidden');
    });
  });

  // ── Lightbox open ──
  document.querySelectorAll('.gallery__item').forEach(item => {
    item.addEventListener('click', () => {
      const event  = item.dataset.event;
      const idx    = parseInt(item.dataset.index, 10);
      const grid   = grids[event];
      currentItems = grid ? Array.from(grid.querySelectorAll('.gallery__item img')) : [];
      currentIndex = idx;
      showImage(currentIndex);
      openLightbox();
    });
  });

  function showImage(i) {
    const img = currentItems[i];
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    currentIndex = i;
  }

  function openLightbox() {
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  lbPrev.addEventListener('click', () => showImage((currentIndex - 1 + currentItems.length) % currentItems.length));
  lbNext.addEventListener('click', () => showImage((currentIndex + 1) % currentItems.length));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showImage((currentIndex - 1 + currentItems.length) % currentItems.length);
    if (e.key === 'ArrowRight') showImage((currentIndex + 1) % currentItems.length);
  });
})();


/* ── 8. RESOURCE MODAL ───────────────────────────────────────── */
(function initResourceModal() {
  const overlay   = document.getElementById('resource-modal');
  if (!overlay) return;

  const titleEl  = document.getElementById('resource-modal-title');
  const bodyEl   = document.getElementById('resource-modal-body');
  const closeBtn = overlay.querySelector('.modal__close');

  const articles = {
    'article-1': `
      <div class="resource-article">
        <p class="resource-article__intro">Unii copii se nasc cu un simț muzical aparte. Încă de la vârste fragede, pot fi observați imitând sunete, reacționând la muzică sau cântând cu o naturalețe surprinzătoare. Dacă ești părinte și te întrebi dacă micuțul tău are ureche muzicală, iată 10 semne care te pot ghida — și câteva idei despre cum să-i susții talentul.</p>
        <ol class="resource-article__list">
          <li><strong>Recunoaște melodii după doar câteva note</strong><br>Dacă identifică rapid piese muzicale, chiar și după primele acorduri, are o memorie auditivă bine dezvoltată — o trăsătură-cheie pentru dezvoltarea muzicală.</li>
          <li><strong>Cântă corect din auz</strong><br>Dacă reproduce fidel o melodie sau fredonează în ton, fără să fi învățat piesa, e un semn clar de ureche muzicală.</li>
          <li><strong>Este foarte atent(ă) la sunetele din jur</strong><br>Un copil cu auz muzical reacționează la zgomote subtile și e adesea fascinat de „cum sună lucrurile".</li>
          <li><strong>Simte ritmul instinctiv</strong><br>Dacă bate din palme, din picior sau se mișcă în sincron cu muzica, ar putea avea simțul ritmului înnăscut.</li>
          <li><strong>Imită cu ușurință voci și instrumente</strong><br>Mulți copii se joacă imitând. Dar cei cu ureche muzicală o fac cu o fidelitate surprinzătoare, ceea ce arată sensibilitate auditivă.</li>
          <li><strong>Are reacții emoționale la muzică</strong><br>Muzica îl liniștește, îl înveselește sau îl emoționează? Înseamnă că o percepe profund și personal.</li>
          <li><strong>Transformă orice obiect în instrument</strong><br>Fie că lovește linguri, cutii sau cărți pentru a crea „muzică", e clar că are o nevoie naturală de a se exprima sonor.</li>
          <li><strong>Reține versurile ușor și le reproduce cu intonație</strong><br>Un copil care memorizează repede melodii și le interpretează corect, deja își dezvoltă urechea muzicală.</li>
          <li><strong>Este atras(ă) de instrumente muzicale</strong><br>Caută mereu să cânte la pian, chitară sau alte instrumente? Chiar dacă nu știe „să cânte", entuziasmul e primul pas.</li>
          <li><strong>Are gusturi muzicale bine conturate</strong><br>Unii copii știu deja ce genuri le plac, ce melodii vor să asculte din nou și din nou. Aceasta arată o legătură profundă cu universul muzicii.</li>
        </ol>
        <h3>Ce poți face mai departe?</h3>
        <p>Dacă ai recunoscut măcar 5–6 dintre semnele de mai sus, e momentul ideal să cultivi această înclinație naturală:</p>
        <ul class="resource-article__tips">
          <li>Creează-i un mediu bogat în sunete și muzică variată.</li>
          <li>Cântați împreună — chiar dacă nu ești muzician!</li>
          <li>Observă ce instrumente sau genuri îl atrag.</li>
          <li>Fii atent(ă) la ritmurile, sunetele și emoțiile care îl fac să vibreze.</li>
          <li>Mai ales: investește în educația lui muzicală timpurie.</li>
        </ul>
        <div class="resource-article__cta">
          <p>🎵 <strong>La Nova Music Academy, transformăm urechea muzicală într-un superputere.</strong></p>
          <p>Dacă ai un copil cu ureche muzicală, locul lui e într-un mediu în care acest dar poate fi recunoscut, ghidat și dezvoltat cu profesionalism. Lucrăm cu copii de toate vârstele și îi ajutăm să își descopere vocea, să învețe instrumente și să se exprime prin muzică.</p>
          <button type="button" class="btn btn--primary" data-modal="registration-modal">🎵 Programează o evaluare gratuită</button>
        </div>
        <p class="resource-article__footer">Muzica începe cu o ureche atentă. Lasă-ne să o ducem mai departe.</p>
      </div>`
  };

  const open = (title, src, type) => {
    titleEl.textContent = title;

    if (type === 'article') {
      bodyEl.innerHTML = articles[src] || '<p>Conținut indisponibil.</p>';
    } else if (type === 'pdf') {
      bodyEl.innerHTML = `<iframe src="${src}" title="${title}"></iframe>`;
    } else {
      bodyEl.innerHTML = `
        <div class="resource-modal__download">
          <span style="font-size:3rem">📄</span>
          <p>Acest fișier nu poate fi previzualizat în browser.<br>Apasă butonul de mai jos pentru a-l descărca.</p>
          <a href="${src}" download class="btn btn--primary btn--large">⬇ Descarcă documentul</a>
        </div>`;
    }

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    bodyEl.innerHTML = '';
  };

  document.querySelectorAll('.resource-card').forEach(card => {
    card.addEventListener('click', () => {
      open(card.dataset.title, card.dataset.resource, card.dataset.type);
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });
})();


/* ── 9. FAQ ACCORDION ─────────────────────────────────────────── */
(function initFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq__question');
    if (!btn) return;

    const isOpen  = btn.getAttribute('aria-expanded') === 'true';
    const answer  = btn.nextElementSibling;

    // Close all others
    list.querySelectorAll('.faq__question[aria-expanded="true"]').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.hidden = true;
      }
    });

    btn.setAttribute('aria-expanded', String(!isOpen));
    answer.hidden = isOpen;
  });
})();


/* ── 8. REGISTRATION MODAL ───────────────────────────────────── */
(function initRegistrationModal() {
  const overlay = document.getElementById('registration-modal');
  if (!overlay) return;

  const modal      = overlay.querySelector('.modal');
  const closeBtn   = overlay.querySelector('.modal__close');
  const form       = overlay.querySelector('#registration-form');
  const firstInput = overlay.querySelector('input, select, textarea');

  const open = () => {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  };

  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Open on any [data-modal="registration-modal"] trigger
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal="registration-modal"]');
    if (trigger) { e.preventDefault(); open(); }
  });

  // Close on X button
  if (closeBtn) closeBtn.addEventListener('click', close);

  // Close on overlay backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn   = form.querySelector('[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Se trimite...';

      const data = {
        name:           form.querySelector('#reg-name')?.value,
        phone:          form.querySelector('#reg-phone')?.value,
        email:          form.querySelector('#reg-email')?.value,
        dob:            form.querySelector('#reg-dob')?.value,
        sex:            form.querySelector('#reg-sex')?.value,
        course:         form.querySelector('#reg-course')?.value,
        source:         form.querySelector('#reg-source')?.value,
        goal:           form.querySelector('#reg-goal')?.value,
        gdpr:           form.querySelector('[name="gdpr"]')?.checked,
        contactConsent: form.querySelector('[name="contact_consent"]')?.checked,
      };

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: '11b8704d-07a0-4ca0-9626-51a07d3c1a78',
            subject: 'Cerere Evaluare Gratuită — Nova Music Academy',
            from_name: 'Nova Music Academy — Website',
            'Nume și Prenume':     data.name,
            'Telefon':             data.phone,
            'Email':               data.email,
            'Data Nașterii':       data.dob,
            'Curs dorit':          data.course,
            'Sursa':               data.source,
            'Obiectiv muzical':    data.goal,
            'Acord GDPR':          data.gdpr ? 'Da' : 'Nu',
            'Acord contactare':    data.contactConsent ? 'Da' : 'Nu',
          }),
        });

        const result = await res.json();

        if (result.success) {
          submitBtn.innerHTML = '✓ Cerere trimisă!';
          form.reset();
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            close();
          }, 2500);
        } else {
          throw new Error('Web3Forms error');
        }
      } catch {
        // Fallback — WhatsApp
        const msg = `Bună ziua! Doresc să rezerv o evaluare gratuită${data.course ? ' de ' + data.course : ''}. Mă numesc ${data.name}, tel: ${data.phone}`;
        window.open(`https://wa.me/40771089525?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
})();


/* ── 8. DISCIPLINE MODAL ─────────────────────────────────────── */
(function initDisciplineModal() {
  const overlay = document.getElementById('discipline-modal');
  if (!overlay) return;

  const modal       = overlay.querySelector('.modal--discipline');
  const closeBtn    = overlay.querySelector('.modal__close');
  const elIcon      = document.getElementById('discipline-modal-icon');
  const elBadge     = document.getElementById('discipline-modal-badge');
  const elName      = document.getElementById('discipline-modal-name');
  const elIntro     = document.getElementById('discipline-modal-intro');
  const elPoints    = document.getElementById('discipline-modal-points');
  const elMeta      = document.getElementById('discipline-modal-meta');
  const ctaBtn      = overlay.querySelector('.btn--primary');

  const disciplines = {
    'canto-cvt': {
      icon: '🎤',
      name: 'Canto CVT',
      badge: 'Vârstă minimă: 4 ani',
      intro: 'Complete Vocal Technique (CVT) este cea mai avansată metodă de tehnică vocală din lume. Învățăm să cântăm corect și sănătos, indiferent de gen muzical — pop, rock, jazz sau clasic.',
      points: [
        'Înțelegerea și controlul vocii proprii',
        'Tehnica respirației și a suportului diafragmatic',
        'Moduri vocale CVT: Neutral, Curbing, Overdrive, Edge',
        'Eliminarea încordării și a tensiunii vocale',
        'Repertoriu adaptat stilului preferat',
        'Pregătire pentru audiții și scene',
      ],
      meta: ['4+ ani', 'Copii & adulți', 'Online disponibil'],
    },
    pian: {
      icon: '🎹',
      name: 'Pian',
      badge: 'Cel mai popular curs · 4+ ani',
      intro: 'Pianul este instrumentul care deschide toate ușile muzicii. De la primele note la piese complexe, predăm atât clasic cât și contemporan, adaptând mereu la personalitatea elevului.',
      points: [
        'Poziția corectă și tehnica mâinilor',
        'Cititul notelor și solfegiu de bază',
        'Repertoriu clasic: Mozart, Beethoven, Bach',
        'Piese moderne și contemporane',
        'Armonie și teoria muzicii aplicate',
        'Repertoriu Pop adaptat preferințelor fiecărui student',
      ],
      meta: ['4+ ani', 'Copii & adulți', 'Online disponibil', 'Cel mai popular'],
    },
    chitara: {
      icon: '🎸',
      name: 'Chitară',
      badge: 'Vârstă minimă: 6 ani',
      intro: 'Acustică, electrică sau clasică — chitara este instrumentul libertății muzicale. De la primele acorduri până pe scene mari, te însoțim în fiecare pas.',
      points: [
        'Acorduri de bază și progresii armonice',
        'Tehnica fingerpicking și plectrum',
        'Chitară clasică (note și partituri)',
        'Chitară electrică: rock, blues, pop',
        'Solo și improvizație',
        'Citit tablatură și partituri standard',
      ],
      meta: ['6+ ani', 'Copii & adulți', 'Online disponibil'],
    },
    teorie: {
      icon: '🎼',
      name: 'Teorie Muzicală',
      badge: 'Vârstă minimă: 6 ani',
      intro: 'Teoria muzicală este fundația oricărui muzician complet. Înveți să citești partituri, să înțelegi armonia și să comunici muzical cu oricine — indiferent de instrument.',
      points: [
        'Solfegiu și citit partituri',
        'Ritmică și metru muzical',
        'Intervale, acorduri și tonalități',
        'Armonie de bază și progresii',
        'Dicteu muzical și ureche absolută',
        'Aplicat direct pe instrumentul preferat',
      ],
      meta: ['6+ ani', 'Copii & adulți', 'Online disponibil'],
    },
    saxofon: {
      icon: '🎷',
      name: 'Saxofon',
      badge: 'Vârstă minimă: 7 ani',
      intro: 'Unul dintre cele mai expresive instrumente din lume. Saxofonul combină rafinamentul jazzului cu versatilitatea pop-ului și a muzicii clasice.',
      points: [
        'Asamblarea și îngrijirea instrumentului',
        'Embouchure și tehnica de suflat',
        'Scări, arpegii și tehnici de bază',
        'Repertoriu jazz, clasic și pop',
        'Improvizație și frazare',
        'Ansambluri și muzică de cameră',
      ],
      meta: ['7+ ani', 'Copii & adulți', 'Online disponibil'],
    },
    vioara: {
      icon: '🎻',
      name: 'Vioară',
      badge: 'Vârstă minimă: 5 ani',
      intro: 'Vioara formează disciplina, concentrarea și sensibilitatea artistică. Un instrument cu o tradiție muzicală bogată, care dezvoltă elevul complet — muzical și uman.',
      points: [
        'Poziția corectă și tehnica arcușului',
        'Intonație și auzul muzical',
        'Repertoriu clasic sau Pop, adaptat preferințelor fiecărui student',
        'Tehnici avansate: vibrato, spiccato, détaché',
        'Citirea partiturilor și solfegiu',
        'Pregătire pentru concursuri și examene',
      ],
      meta: ['5+ ani', 'Copii & adulți'],
    },
    productie: {
      icon: '🎧',
      name: 'Producție Muzicală',
      badge: 'Vârstă minimă: 14 ani · NOU',
      intro: 'Creează muzică de la zero, direct de acasă. Predăm folosind Ableton, FL Studio sau Logic Pro — de la primele beat-uri până la mixuri gata de lansare.',
      points: [
        'Introducere în DAW (Ableton / FL Studio / Logic)',
        'Beatmaking și sound design',
        'Sampling, sintetizatoare și instrumente virtuale',
        'Mixing: EQ, compressor, reverb',
        'Mastering de bază',
        'Publicarea și distribuția muzicii',
      ],
      meta: ['14+ ani', 'Adulți', 'Online disponibil', 'Nou'],
    },
    tobe: {
      icon: '🥁',
      name: 'Tobe',
      badge: 'Vârstă minimă: 5 ani',
      intro: 'Tobele dezvoltă simțul ritmului, coordonarea și energia muzicală. Un curs plin de dinamism, potrivit atât copiilor cât și adulților care vor să cânte în formații.',
      points: [
        'Tehnica basică de tobe: postura și priza bețelor',
        'Ritmuri de bază: rock, pop, funk',
        'Coordonarea mâini-picioare',
        'Citirea partiturilor pentru percuție',
        'Improvizație și fill-uri',
        'Cântare în ansamblu și band context',
      ],
      meta: ['5+ ani', 'Copii & adulți', 'Online disponibil'],
    },
  };

  function open(key) {
    const d = disciplines[key];
    if (!d) return;

    elIcon.textContent  = d.icon;
    elBadge.textContent = d.badge;
    elName.textContent  = d.name;
    elIntro.textContent = d.intro;

    elPoints.innerHTML = d.points.map(p => `<li>${p}</li>`).join('');

    elMeta.innerHTML = d.meta
      .map(m => `<span class="badge">${m}</span>`)
      .join('');

    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Open on card button click
  document.querySelectorAll('.instrument-card[data-discipline]').forEach(card => {
    const btn = card.querySelector('button');
    if (btn) btn.addEventListener('click', () => open(card.dataset.discipline));
  });

  // Close via × button
  closeBtn.addEventListener('click', close);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
  });

  // CTA inside discipline modal opens registration modal
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      close();
      const regOverlay = document.getElementById('registration-modal');
      if (regOverlay) {
        regOverlay.setAttribute('aria-hidden', 'false');
        regOverlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // Footer links with data-discipline scroll to section then open modal
  document.querySelectorAll('a[data-discipline]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const key = link.dataset.discipline;
      const section = document.getElementById('cursuri');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    '.instrument-card',
    '.feature-card',
    '.cvt-card',
    '.teacher-card',
    '.testimonial-card',
    '.resource-card',
    '.faq__item',
  ];

  // Elements to reveal as section headers
  const headerSelectors = [
    '.section-title',
    '.pre-header',
    '.cvt-section__lead',
    '.cvt-section__text',
    '.cvt-section__quote',
    '.cvt-section__cta',
  ];

  // Add reveal class to headers
  document.querySelectorAll(headerSelectors.join(',')).forEach(el => {
    // Skip hero elements — they have CSS animation already
    if (el.closest('.hero')) return;
    el.classList.add('section-reveal');
  });

  // Add reveal + stagger delay to cards
  cardSelectors.forEach(sel => {
    const groups = {};
    document.querySelectorAll(sel).forEach(el => {
      const parent = el.parentElement;
      if (!groups.has) groups[parent] = groups[parent] || [];
      groups[parent].push(el);
    });
    // Group siblings together for stagger
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add('reveal');
    });
    // Apply stagger per parent group
    const parents = new Set(
      Array.from(document.querySelectorAll(sel)).map(el => el.parentElement)
    );
    parents.forEach(parent => {
      parent.querySelectorAll(sel).forEach((el, i) => {
        el.setAttribute('data-delay', String((i % 6) + 1));
      });
    });
  });

  // Bail out if no IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .section-reveal').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .section-reveal').forEach(el => obs.observe(el));
})();


/* ── 10. SMOOTH SCROLL for anchor links ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
