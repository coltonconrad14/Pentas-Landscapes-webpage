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
  initScrollSpy();
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

  function onScroll() {
    const scrollY = window.scrollY;

    // Add scrolled class after 60px
    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
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
  let lockedScrollY = 0;

  if (!hamburger || !navLinks || !overlay) return;

  function openMenu() {
    lockedScrollY = window.scrollY;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = '100%';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, lockedScrollY);
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

  // Ensure mobile drawer is closed when switching back to desktop width.
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
      closeMenu();
    }
  }, 120));
}

/* ============================================================
   3. ACTIVE SECTION LINK (ScrollSpy)
   ============================================================ */
function initScrollSpy() {
  const links = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  const linkById = new Map(
    links
      .map(link => [link.getAttribute('href').slice(1), link])
  );

  const visibility = new Map(sections.map(section => [section.id, 0]));

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      let activeId = null;
      let maxRatio = 0;
      visibility.forEach((ratio, id) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          activeId = id;
        }
      });

      if (activeId) {
        setActive(activeId);
      }
    },
    {
      threshold: 0.45,
      rootMargin: '-20% 0px -35% 0px'
    }
  );

  sections.forEach(section => observer.observe(section));

  // Establish an initial active link before observer callbacks fire.
  const initial = sections.find(section => section.getBoundingClientRect().top >= 0) || sections[0];
  if (initial) {
    setActive(initial.id);
  }

  function setActive(id) {
    links.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    const active = linkById.get(id);
    if (active) {
      active.classList.add('active');
      active.setAttribute('aria-current', 'page');
    }
  }
}

/* ============================================================
   4. SCROLL ANIMATIONS (Intersection Observer)
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
  5. HERO PARALLAX
   ============================================================ */
function initHeroParallax() {
  const heroBg = document.getElementById('heroBg');
  const heroContent = document.querySelector('.reveal-hero');
  const hero = document.querySelector('.hero');

  // Reveal hero content on load
  if (heroContent) {
    requestAnimationFrame(() => {
      heroContent.classList.add('visible');
    });
  }

  if (!heroBg) return;

  // Skip parallax on reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Skip heavy parallax transforms on narrow screens.
  if (window.matchMedia('(max-width: 900px)').matches) return;

  let ticking = false;
  let heroMax = hero?.offsetHeight || 600;

  function updateParallax() {
    const scrollY = window.scrollY;
    if (scrollY > heroMax) {
      heroBg.style.transform = '';
      return;
    }

    const yMove = scrollY * 0.35;
    heroBg.style.transform = `translateY(${yMove}px)`;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  }

  window.addEventListener('resize', debounce(() => {
    heroMax = hero?.offsetHeight || 600;
  }, 150));

  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax();
}

/* ============================================================
  6. ANIMATED COUNTERS (Hero Badges)
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
  7. SERVICE CARDS — Touch Support for Flip
   ============================================================ */
function initServiceCards() {
  // On touch devices, toggle flip on tap instead of hover
  if (!window.matchMedia('(hover: none)').matches) return;

  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const shouldFlip = !card.classList.contains('flipped');

      // Keep one card open at a time on touch screens.
      cards.forEach(other => other.classList.remove('flipped'));
      if (shouldFlip) {
        card.classList.add('flipped');
      }
    });
  });
}

/* ============================================================
  8. CLASS TABS
   ============================================================ */
function initClassTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.classes-panel');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.tabIndex = tab.classList.contains('tab-btn--active') ? 0 : -1;
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => {
        t.classList.remove('tab-btn--active');
        t.setAttribute('aria-selected', 'false');
        t.tabIndex = -1;
      });

      panels.forEach(p => {
        p.classList.remove('classes-panel--active');
        p.hidden = true;
      });

      // Activate clicked
      tab.classList.add('tab-btn--active');
      tab.setAttribute('aria-selected', 'true');
      tab.tabIndex = 0;

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
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const allTabs = [...tabs];
        const idx = allTabs.indexOf(tab);

        let next = idx;
        if (e.key === 'ArrowRight') {
          next = (idx + 1) % allTabs.length;
        } else if (e.key === 'ArrowLeft') {
          next = (idx - 1 + allTabs.length) % allTabs.length;
        } else if (e.key === 'Home') {
          next = 0;
        } else if (e.key === 'End') {
          next = allTabs.length - 1;
        }

        allTabs[next].focus();
        allTabs[next].click();
      }
    });
  });
}

/* ============================================================
  9. TESTIMONIALS SLIDER
   ============================================================ */
function initTestimonialSlider() {
  const track  = document.getElementById('testimonialsTrack');
  const dotsEl = document.getElementById('testimonialDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (!track) return;

  const cards = [...track.querySelectorAll('.testimonial-card')];
  const total = cards.length;
  const controls = document.querySelector('.testimonials-controls');

  if (!total) return;

  if (total === 1) {
    controls?.setAttribute('hidden', 'hidden');
    return;
  }

  let current = 0;
  let autoTimer = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let inView = true;

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

  nextBtn?.addEventListener('click', () => {
    if (!reduceMotion) resetTimer();
    next();
  });
  prevBtn?.addEventListener('click', () => {
    if (!reduceMotion) resetTimer();
    prev();
  });

  // Auto-play
  function startTimer() {
    if (!inView) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 5500);
  }

  function pauseTimer() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function resetTimer() {
    pauseTimer();
    startTimer();
  }

  if (!reduceMotion) {
    startTimer();
  }

  // Pause on hover / focus
  const section = document.getElementById('testimonials');
  section?.addEventListener('mouseenter', () => {
    if (!reduceMotion) pauseTimer();
  });
  section?.addEventListener('mouseleave', () => {
    if (!reduceMotion) startTimer();
  });
  section?.addEventListener('focusin', () => {
    if (!reduceMotion) pauseTimer();
  });
  section?.addEventListener('focusout', () => {
    if (!reduceMotion) startTimer();
  });

  if (section && !reduceMotion) {
    const visibilityObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          inView = entry.isIntersecting;
          if (inView) {
            startTimer();
          } else {
            pauseTimer();
          }
        });
      },
      { threshold: 0.2 }
    );

    visibilityObserver.observe(section);
  }

  // Swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (!reduceMotion) resetTimer();
      diff > 0 ? next() : prev();
    }
  }, { passive: true });

  // Keyboard left/right arrows when focused inside
  section?.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      if (!reduceMotion) resetTimer();
      next();
    }
    if (e.key === 'ArrowLeft') {
      if (!reduceMotion) resetTimer();
      prev();
    }
  });
}

/* ============================================================
   10. CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const success   = document.getElementById('formSuccess');
  let successTimer = null;

  if (!form) return;

  // Real-time validation
  const fields = form.querySelectorAll('input[required], select[required], input[type="tel"]');
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);

      // Dismiss success state when user begins editing a new request.
      if (success && !success.hidden) {
        success.hidden = true;
      }
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
    if (btnText) btnText.hidden = true;
    if (btnLoading) btnLoading.hidden = false;

    await new Promise(resolve => setTimeout(resolve, 1200));

    // Show success state
    if (success) {
      success.hidden = false;
      success.removeAttribute('hidden');

      clearTimeout(successTimer);
      successTimer = setTimeout(() => {
        success.hidden = true;
      }, 6000);
    }

    form.reset();

    if (btnText) btnText.hidden = false;
    if (btnLoading) btnLoading.hidden = true;
    submitBtn.disabled = false;
  });
}

function validateField(field) {
  const errorEl = field.closest('.form-group')?.querySelector('.form-error');
  const value   = field.value.trim();
  let message   = '';

  if (field.hasAttribute('required') && !value) {
    message = `${getFieldLabel(field)} is required.`;
  } else if (field.type === 'email' && !isValidEmail(value)) {
    message = 'Please enter a valid email address.';
  } else if (field.type === 'tel' && value && !isValidPhone(value)) {
    message = 'Please enter a valid phone number.';
  }

  if (message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message;
    return false;
  } else {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
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

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/* ============================================================
  11. BACK TO TOP
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
  12. FOOTER YEAR
   ============================================================ */
function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
  13. SMOOTH SCROLL (fallback for older browsers)
   ============================================================ */
function initSmoothScroll() {
  const useSmooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: useSmooth ? 'smooth' : 'auto', block: 'start' });
    });
  });
}
