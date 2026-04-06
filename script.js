/**
 * Pentas Landscapes — Main JavaScript
 * Interactive & dynamic UI behaviors
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/**
 * Clamp a value between min and max.
 */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Debounce: delay function execution until after idle.
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHamburger();
  initScrollAnimations();
  initHeroParallax();
  initCounters();
  initServiceCards();
  initClassTabs();
  initTestimonialSlider();
  initContactForm();
  initBackToTop();
  initFooterYear();
  initSmoothScroll();
});

/* ============================================================
   1. STICKY HEADER
   ============================================================ */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let lastScroll = 0;

  function onScroll() {
    const scrollY = window.scrollY;

    // Add scrolled class after 60px
    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ============================================================
   2. HAMBURGER MENU
   ============================================================ */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const overlay   = document.getElementById('navOverlay');

  if (!hamburger || !navLinks || !overlay) return;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on overlay click
  overlay.addEventListener('click', closeMenu);

  // Close when a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
}

/* ============================================================
   3. SCROLL ANIMATIONS (Intersection Observer)
   ============================================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   4. HERO PARALLAX
   ============================================================ */
function initHeroParallax() {
  const heroBg = document.getElementById('heroBg');
  const heroContent = document.querySelector('.reveal-hero');

  // Reveal hero content on load
  if (heroContent) {
    requestAnimationFrame(() => {
      heroContent.classList.add('visible');
    });
  }

  if (!heroBg) return;

  // Skip parallax on reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function updateParallax() {
    const scrollY = window.scrollY;
    const max = document.querySelector('.hero')?.offsetHeight || 600;
    if (scrollY > max) return;

    const yMove = scrollY * 0.35;
    heroBg.style.transform = `translateY(${yMove}px)`;
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
}

/* ============================================================
   5. ANIMATED COUNTERS (Hero Badges)
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCount(el, 0, target, 1400);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

function animateCount(el, from, to, duration) {
  const start = performance.now();

  function frame(now) {
    const elapsed = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

/* ============================================================
   6. SERVICE CARDS — Touch Support for Flip
   ============================================================ */
function initServiceCards() {
  // On touch devices, toggle flip on tap instead of hover
  if (!window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

/* ============================================================
   7. CLASS TABS
   ============================================================ */
function initClassTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.classes-panel');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => {
        t.classList.remove('tab-btn--active');
        t.setAttribute('aria-selected', 'false');
      });

      panels.forEach(p => {
        p.classList.remove('classes-panel--active');
        p.hidden = true;
      });

      // Activate clicked
      tab.classList.add('tab-btn--active');
      tab.setAttribute('aria-selected', 'true');

      const panelId = tab.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if (panel) {
        panel.hidden = false;
        panel.classList.add('classes-panel--active');

        // Re-run scroll animations for newly shown cards
        panel.querySelectorAll('.fade-in').forEach(el => {
          el.classList.remove('visible');
          // Small delay so the browser can register the class removal
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.classList.add('visible');
            });
          });
        });
      }
    });

    // Keyboard navigation for tabs
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const allTabs = [...tabs];
        const idx = allTabs.indexOf(tab);
        const next = e.key === 'ArrowRight'
          ? (idx + 1) % allTabs.length
          : (idx - 1 + allTabs.length) % allTabs.length;
        allTabs[next].focus();
        allTabs[next].click();
      }
    });
  });
}

/* ============================================================
   8. TESTIMONIALS SLIDER
   ============================================================ */
function initTestimonialSlider() {
  const track  = document.getElementById('testimonialsTrack');
  const dotsEl = document.getElementById('testimonialDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (!track) return;

  const cards = [...track.querySelectorAll('.testimonial-card')];
  const total = cards.length;
  let current = 0;
  let autoTimer = null;

  // Build dots
  const dots = cards.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl?.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Update ARIA live
    const slider = document.getElementById('testimonialsSlider');
    if (slider) {
      slider.setAttribute('aria-label',
        `Testimonial ${current + 1} of ${total}`);
    }
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn?.addEventListener('click', () => { resetTimer(); next(); });
  prevBtn?.addEventListener('click', () => { resetTimer(); prev(); });

  // Auto-play
  function startTimer() {
    autoTimer = setInterval(next, 5500);
  }

  function resetTimer() {
    clearInterval(autoTimer);
    startTimer();
  }

  startTimer();

  // Pause on hover / focus
  const section = document.getElementById('testimonials');
  section?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  section?.addEventListener('mouseleave', startTimer);
  section?.addEventListener('focusin',    () => clearInterval(autoTimer));
  section?.addEventListener('focusout',   startTimer);

  // Swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      resetTimer();
      diff > 0 ? next() : prev();
    }
  }, { passive: true });

  // Keyboard left/right arrows when focused inside
  section?.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { resetTimer(); next(); }
    if (e.key === 'ArrowLeft')  { resetTimer(); prev(); }
  });
}

/* ============================================================
   9. CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const success   = document.getElementById('formSuccess');

  if (!form) return;

  // Real-time validation
  const fields = form.querySelectorAll('input[required], select[required]');
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all required fields
    let valid = true;
    fields.forEach(field => {
      if (!validateField(field)) valid = false;
    });

    if (!valid) return;

    // Simulate async submission
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = true;
    btnText.hidden    = true;
    btnLoading.hidden = false;

    await new Promise(resolve => setTimeout(resolve, 1200));

    // Show success state
    if (success) {
      success.hidden = false;
      success.removeAttribute('hidden');
    }
  });
}

function validateField(field) {
  const errorEl = field.closest('.form-group')?.querySelector('.form-error');
  const value   = field.value.trim();
  let message   = '';

  if (!value) {
    message = `${getFieldLabel(field)} is required.`;
  } else if (field.type === 'email' && !isValidEmail(value)) {
    message = 'Please enter a valid email address.';
  }

  if (message) {
    field.classList.add('error');
    if (errorEl) errorEl.textContent = message;
    return false;
  } else {
    field.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
    return true;
  }
}

function getFieldLabel(field) {
  const label = field.closest('.form-group')?.querySelector('label');
  return label ? label.textContent.replace('*', '').trim() : 'This field';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   10. BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function update() {
    const show = window.scrollY > 500;
    btn.classList.toggle('visible', show);
    btn.hidden = !show;
  }

  window.addEventListener('scroll', update, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   11. FOOTER YEAR
   ============================================================ */
function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   12. SMOOTH SCROLL (fallback for older browsers)
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
