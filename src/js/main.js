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


/* ── 6. FLOATING CTA ─────────────────────────────────────────── */
(function initFloatingCTA() {
  const cta    = document.querySelector('.floating-cta');
  const heroCTA = document.querySelector('.hero__cta-group');
  const dismiss = document.querySelector('.floating-cta__dismiss');
  if (!cta) return;

  let shown     = false;
  let dismissed = false;

  const show = () => {
    if (dismissed) return;
    cta.classList.add('is-visible');
    shown = true;
  };

  const hide = () => {
    cta.classList.remove('is-visible');
  };

  // Show after 30% scroll
  const onScroll = () => {
    if (dismissed) return;
    const scrollPct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    if (scrollPct > 30 && !shown) show();
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Hide when main CTA enters viewport
  if (heroCTA && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        hide();
      } else if (shown && !dismissed) {
        show();
      }
    });
    obs.observe(heroCTA);
  }

  // Dismiss permanently for this session
  if (dismiss) {
    dismiss.addEventListener('click', () => {
      dismissed = true;
      hide();
      sessionStorage.setItem('nma_cta_dismissed', '1');
    });
  }

  // Restore dismissed state from session
  if (sessionStorage.getItem('nma_cta_dismissed')) {
    dismissed = true;
  }
})();


/* ── 7. BOOKING FORM ─────────────────────────────────────────── */
(function initBookingForm() {
  const form = document.querySelector('.booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Se trimite...';

    const data = {
      name:       form.querySelector('#name')?.value,
      phone:      form.querySelector('#phone')?.value,
      instrument: form.querySelector('#instrument')?.value,
    };

    try {
      // Replace with your actual API endpoint
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Redirect to thank-you page
        window.location.href = '/multumim/';
      } else {
        throw new Error('Server error');
      }
    } catch {
      // Graceful fallback — open WhatsApp
      const msg = `Bună ziua! Doresc să rezerv o lecție gratuită de ${data.instrument}. Numele meu este ${data.name}, tel: ${data.phone}`;
      const waUrl = `https://wa.me/40700000000?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
})();


/* ── 8. SMOOTH SCROLL for anchor links ───────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
