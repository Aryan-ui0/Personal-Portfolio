/* =============================================================
   PORTFOLIO SCRIPT — script.js
   Sections:
   00. Utility helpers
   01. Preloader
   02. Custom cursor
   03. Scroll progress bar
   04. Navbar (scroll effect, hamburger, active link)
   05. Hero typing animation
   06. Particle canvas background
   07. GSAP hero entrance animations
   08. AOS (scroll reveal) init
   09. Animated counters (About section)
   10. Circular skill progress indicators
   11. Skill tab switcher
   12. Skill bar animations
   13. Project filter system
   14. Project modal (quick view)
   15. VanillaTilt on cards
   16. Testimonials carousel
   17. Contact form validation & submit
   18. Back-to-top button
   19. Dark / Light mode toggle
   20. Konami code Easter egg
   21. Smooth anchor scroll
   22. Mouse-follow glow (desktop only)
   23. Scroll-based navbar background
   ============================================================= */

'use strict';

/* ─────────────────────────────────────────────────────────────
   00. UTILITY HELPERS
───────────────────────────────────────────────────────────── */

/** Query single element */
const qs = (sel, root = document) => root.querySelector(sel);

/** Query multiple elements as array */
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Clamp a value between min and max */
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/** Linear interpolation */
const lerp = (a, b, t) => a + (b - a) * t;

/** Check if element is in viewport */
const inViewport = (el, offset = 0) => {
  const rect = el.getBoundingClientRect();
  return rect.top <= window.innerHeight - offset && rect.bottom >= 0;
};

/** Run callback once when element enters viewport */
const onVisible = (el, cb, offset = 80) => {
  if (!el) return;
  const check = () => { if (inViewport(el, offset)) { cb(); observer.disconnect(); } };
  const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { cb(); observer.disconnect(); } }, { rootMargin: `0px 0px -${offset}px 0px` });
  observer.observe(el);
};

/* ─────────────────────────────────────────────────────────────
   01. PRELOADER
───────────────────────────────────────────────────────────── */
(function initPreloader() {
  const preloader = qs('#preloader');
  if (!preloader) return;

  document.body.classList.add('preloading');

  const finish = () => {
    preloader.classList.add('done');
    document.body.classList.remove('preloading');
  };

  // Finish after bar animation (≈2.4 s) or when page fully loaded
  const timer = setTimeout(finish, 2500);
  window.addEventListener('load', () => { clearTimeout(timer); setTimeout(finish, 400); });
})();

/* ─────────────────────────────────────────────────────────────
   02. CUSTOM CURSOR
───────────────────────────────────────────────────────────── */
(function initCursor() {
  const dot  = qs('#cursorDot');
  const ring = qs('#cursorRing');
  if (!dot || !ring) return;

  // Hide native cursor globally (already done via CSS html { cursor: none })
  let mx = 0, my = 0; // mouse position
  let rx = 0, ry = 0; // ring position (lerped)
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    // Dot snaps instantly
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring smoothly follows with lerp
  const animateRing = () => {
    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  };
  animateRing();

  // Expand ring on interactive elements
  const interactiveSelector = 'a, button, .proj-card, .ach-card, .stat-card, .testi-card, input, textarea, .pf-btn, .stab, .tl-card';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveSelector)) ring.classList.add('expanded');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveSelector)) ring.classList.remove('expanded');
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

/* ─────────────────────────────────────────────────────────────
   03. SCROLL PROGRESS BAR
───────────────────────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = qs('#scrollProgress');
  if (!bar) return;

  const update = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ─────────────────────────────────────────────────────────────
   04. NAVBAR
───────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const navLinks  = qs('#navLinks');
  const allLinks  = qsa('.nav-link');
  if (!navbar) return;

  /* ── Scroll glass effect ── */
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);

    /* ── Active section highlighting ── */
    const sections = qsa('section[id]');
    let current = '';

    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= window.innerHeight * 0.4) current = sec.id;
    });

    allLinks.forEach(link => {
      const matches = link.dataset.section === current;
      link.classList.toggle('active', matches);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial call

  /* ── Hamburger toggle ── */
  const closeMenu = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger && hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click
  allLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) closeMenu();
  });
})();

/* ─────────────────────────────────────────────────────────────
   05. HERO TYPING ANIMATION
───────────────────────────────────────────────────────────── */
(function initTyped() {
  const el = qs('#typedTarget');
  if (!el || typeof Typed === 'undefined') return;

  new Typed(el, {
    // EDIT: Add or remove roles here
    strings: [
      'Full Stack Developer',
      'Problem Solver',
      'CS Student',
      'UI / UX Designer',
      'Open Source Contributor',
      'AI / ML Enthusiast',
    ],
    typeSpeed:    52,
    backSpeed:    30,
    backDelay:    1800,
    startDelay:   600,
    loop:         true,
    cursorChar:   '|',
    smartBackspace: true,
  });
})();

/* ─────────────────────────────────────────────────────────────
   06. PARTICLE CANVAS BACKGROUND
───────────────────────────────────────────────────────────── */
(function initParticles() {
  const canvas = qs('#particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  /* ── Resize ── */
  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── Particle factory ── */
  const COUNT = window.innerWidth < 768 ? 40 : 80;

  const isDark = () => document.documentElement.dataset.theme === 'dark';

  const randParticle = () => ({
    x:    Math.random() * W,
    y:    Math.random() * H,
    r:    Math.random() * 2 + 0.5,
    vx:   (Math.random() - 0.5) * 0.4,
    vy:   (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.15,
    hue:  Math.random() < 0.6 ? 228 : 270, // blue or purple
  });

  for (let i = 0; i < COUNT; i++) particles.push(randParticle());

  /* ── Draw ── */
  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    // Draw connection lines between nearby particles
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * (isDark() ? 0.18 : 0.10);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(91, 127, 255, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${isDark() ? p.alpha * 1.8 : p.alpha})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  };
  draw();

  // Stop drawing when hero leaves viewport to save CPU
  const heroSection = qs('#hero');
  if (heroSection) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { cancelAnimationFrame(animId); }
      else { draw(); }
    }, { threshold: 0.01 });
    io.observe(heroSection);
  }
})();

/* ─────────────────────────────────────────────────────────────
   07. GSAP HERO ENTRANCE ANIMATIONS
───────────────────────────────────────────────────────────── */
(function initGSAPHero() {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Wait until preloader finishes (≈2.6 s)
  const run = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-greeting', { opacity: 0, y: 20, duration: 0.7 })
      .from('.name-first',    { opacity: 0, y: 40, duration: 0.8 }, '-=0.3')
      .from('.name-last',     { opacity: 0, y: 40, duration: 0.8 }, '-=0.5')
      .from('.hero-roles',    { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('.hero-bio',      { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('.hero-cta',      { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
      .from('.hero-social',   { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
      .from('.hero-img-wrap', { opacity: 0, scale: 0.85, duration: 1,  ease: 'back.out(1.4)' }, '-=0.9')
      .from('.float-badge',   { opacity: 0, scale: 0.7, stagger: 0.15, duration: 0.7, ease: 'back.out(1.7)' }, '-=0.5')
      .from('.scroll-hint',   { opacity: 0, y: 10, duration: 0.6 }, '-=0.2');
  };

  // Start after preloader
  setTimeout(run, 2700);

  /* ── Parallax orbs on scroll ── */
  gsap.to('.o1', { yPercent: -25, ease: 'none', scrollTrigger: { trigger: '#hero', scrub: 1 } });
  gsap.to('.o2', { yPercent: -15, ease: 'none', scrollTrigger: { trigger: '#hero', scrub: 1.5 } });
  gsap.to('.o3', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: '#hero', scrub: 0.8 } });
})();

/* ─────────────────────────────────────────────────────────────
   08. AOS INIT
───────────────────────────────────────────────────────────── */
(function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration:   700,
    easing:     'ease-out-cubic',
    once:       true,
    offset:     60,
    delay:      0,
  });
})();

/* ─────────────────────────────────────────────────────────────
   09. ANIMATED COUNTERS
───────────────────────────────────────────────────────────── */
(function initCounters() {
  const counters = qsa('.counter');
  if (!counters.length) return;

  const animate = el => {
    const target   = +el.dataset.target || 0;
    const duration = 1600; // ms
    const step     = 16;   // ~60fps frame
    const increment = target / (duration / step);
    let current = 0;

    const tick = () => {
      current += increment;
      if (current < target) {
        el.textContent = Math.floor(current);
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(tick);
  };

  const aboutSection = qs('#about');
  if (!aboutSection) return;

  onVisible(aboutSection, () => counters.forEach(animate), 100);
})();

/* ─────────────────────────────────────────────────────────────
   10. CIRCULAR SKILL PROGRESS
───────────────────────────────────────────────────────────── */
(function initCircleSkills() {
  const items = qsa('.sc-item');
  if (!items.length) return;

  // SVG gradient definition injected once
  const svgNS = 'http://www.w3.org/2000/svg';
  const defs  = document.createElementNS(svgNS, 'defs');
  const grad  = document.createElementNS(svgNS, 'linearGradient');
  grad.id = 'scGrad';
  grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');

  const s1 = document.createElementNS(svgNS, 'stop');
  s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#5b7fff');
  const s2 = document.createElementNS(svgNS, 'stop');
  s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#9b7de8');
  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);

  // Attach defs to first SVG
  const firstSvg = qs('.sc-item svg');
  if (firstSvg) firstSvg.insertBefore(defs, firstSvg.firstChild);

  const CIRC = 2 * Math.PI * 48; // ≈ 301.6

  const animate = () => {
    items.forEach(item => {
      const pct  = +item.dataset.percent || 0;
      const fill = item.querySelector('.sc-fill');
      if (!fill) return;
      const dash = (pct / 100) * CIRC;
      fill.style.strokeDasharray = `${dash} ${CIRC - dash}`;
    });
  };

  const skillsSection = qs('#skills');
  if (skillsSection) onVisible(skillsSection, animate, 80);
})();

/* ─────────────────────────────────────────────────────────────
   11. SKILL TAB SWITCHER
───────────────────────────────────────────────────────────── */
(function initSkillTabs() {
  const tabBtns    = qsa('.stab');
  const tabPanes   = qsa('.stab-pane');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b  => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = qs(`#stab-${target}`);
      if (pane) {
        pane.classList.add('active');
        // Animate bars inside newly-visible pane
        animateBarsInPane(pane);
      }
    });
  });

  // Animate bars in the initially-visible tab when it enters viewport
  const skillsSection = qs('#skills');
  if (skillsSection) {
    onVisible(skillsSection, () => {
      const activePn = qs('.stab-pane.active');
      if (activePn) animateBarsInPane(activePn);
    }, 80);
  }
})();

/* ─────────────────────────────────────────────────────────────
   12. SKILL BAR ANIMATIONS
───────────────────────────────────────────────────────────── */
function animateBarsInPane(pane) {
  if (!pane) return;
  const bars = qsa('.sb-fill', pane);
  bars.forEach((bar, i) => {
    setTimeout(() => {
      bar.style.width = (bar.dataset.w || 0) + '%';
    }, i * 80);
  });
}

/* ─────────────────────────────────────────────────────────────
   13. PROJECT FILTER SYSTEM
───────────────────────────────────────────────────────────── */
(function initProjectFilter() {
  const filterBtns = qsa('.pf-btn');
  const cards      = qsa('.proj-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach((card, idx) => {
        const cats = card.dataset.category || '';
        const show = filter === 'all' || cats.split(' ').includes(filter);

        if (show) {
          card.classList.remove('hidden');
          card.style.animationDelay = `${idx * 60}ms`;
          // Force reflow to re-trigger animation
          void card.offsetWidth;
          card.style.opacity   = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => card.classList.add('hidden'), 350);
        }
      });
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   14. PROJECT MODAL
───────────────────────────────────────────────────────────── */
(function initProjectModal() {
  const modal       = qs('#projModal');
  const closeBtn    = qs('#modalCloseBtn');
  const viewBtns    = qsa('.proj-view-btn');
  if (!modal) return;

  const open = card => {
    // Populate modal with card data
    qs('.modal-title', modal).textContent     = card.dataset.title || 'Project';
    qs('.modal-desc',  modal).textContent     = card.dataset.desc  || '';
    qs('.modal-cat',   modal).innerHTML       = `<span class="proj-cat-tag">${card.querySelector('.proj-cat-tag')?.textContent || ''}</span>`;

    // Tech tags
    const techWrap = qs('.modal-tech-tags', modal);
    techWrap.innerHTML = '';
    (card.dataset.tech || '').split(',').forEach(t => {
      const span = document.createElement('span');
      span.textContent = t.trim();
      techWrap.appendChild(span);
    });

    // Buttons
    const ghBtn = qs('.modal-gh', modal);
    const lvBtn = qs('.modal-lv', modal);
    const ghUrl = card.dataset.github || '#';
    const lvUrl = card.dataset.live   || '';

    ghBtn.href = ghUrl;
    if (lvUrl) {
      lvBtn.href = lvUrl;
      lvBtn.style.display = '';
    } else {
      lvBtn.style.display = 'none';
    }

    // Icon from card
    const icon = card.querySelector('.proj-img-ph i');
    qs('.modal-img-ph', modal).innerHTML = icon ? icon.outerHTML : '<i class="fas fa-image"></i>';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  viewBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      open(btn.closest('.proj-card'));
    });
  });

  closeBtn && closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

/* ─────────────────────────────────────────────────────────────
   15. VANILLA TILT ON CARDS
───────────────────────────────────────────────────────────── */
(function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;

  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  VanillaTilt.init(qsa('.proj-card, .ach-card, .stat-card'), {
    max:           8,
    speed:         400,
    glare:         true,
    'max-glare':   0.12,
    scale:         1.03,
    perspective:   1000,
  });
})();

/* ─────────────────────────────────────────────────────────────
   16. TESTIMONIALS CAROUSEL
───────────────────────────────────────────────────────────── */
(function initCarousel() {
  const track   = qs('#testiTrack');
  const prevBtn = qs('#testiPrev');
  const nextBtn = qs('#testiNext');
  const dotsWrap= qs('#testiDots');
  if (!track) return;

  const cards  = qsa('.testi-card', track);
  const total  = cards.length;
  let current  = 0;
  let autoplay;

  /* Build dots */
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap && dotsWrap.appendChild(dot);
  });

  const updateDots = () => {
    qsa('.testi-dot', dotsWrap).forEach((d, i) => d.classList.toggle('active', i === current));
  };

  const goTo = idx => {
    current = (idx + total) % total;
    track.style.transform = `translateX(calc(-${current * 100}% - ${current}rem))`;
    updateDots();
  };

  nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });

  /* Autoplay */
  const startAuto = () => { autoplay = setInterval(() => goTo(current + 1), 5000); };
  const resetAuto = () => { clearInterval(autoplay); startAuto(); };
  startAuto();

  /* Touch swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx < 0 ? goTo(current + 1) : goTo(current - 1); resetAuto(); }
  });

  /* Pause on hover */
  track.closest('.testi-carousel') && track.closest('.testi-carousel').addEventListener('mouseenter', () => clearInterval(autoplay));
  track.closest('.testi-carousel') && track.closest('.testi-carousel').addEventListener('mouseleave', startAuto);
})();

/* ─────────────────────────────────────────────────────────────
   17. CONTACT FORM VALIDATION & SUBMIT
───────────────────────────────────────────────────────────── */
(function initContactForm() {
  const nameEl    = qs('#cfName');
  const emailEl   = qs('#cfEmail');
  const subjectEl = qs('#cfSubject');
  const msgEl     = qs('#cfMsg');
  const submitBtn = qs('#cfSubmit');
  const successEl = qs('#cfSuccess');
  if (!submitBtn) return;

  const errEls = {
    name:    qs('#cfNameErr'),
    email:   qs('#cfEmailErr'),
    subject: qs('#cfSubjectErr'),
    message: qs('#cfMsgErr'),
  };

  const showErr = (key, msg) => { if (errEls[key]) errEls[key].textContent = msg; };
  const clearErr= key       => { if (errEls[key]) errEls[key].textContent = '';  };

  const validateEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validate = () => {
    let ok = true;

    if (!nameEl.value.trim()) {
      showErr('name', 'Name is required.'); ok = false;
    } else if (nameEl.value.trim().length < 2) {
      showErr('name', 'Name must be at least 2 characters.'); ok = false;
    } else {
      clearErr('name');
    }

    if (!emailEl.value.trim()) {
      showErr('email', 'Email is required.'); ok = false;
    } else if (!validateEmail(emailEl.value.trim())) {
      showErr('email', 'Please enter a valid email address.'); ok = false;
    } else {
      clearErr('email');
    }

    if (!subjectEl.value.trim()) {
      showErr('subject', 'Subject is required.'); ok = false;
    } else {
      clearErr('subject');
    }

    if (!msgEl.value.trim()) {
      showErr('message', 'Message is required.'); ok = false;
    } else if (msgEl.value.trim().length < 10) {
      showErr('message', 'Message must be at least 10 characters.'); ok = false;
    } else {
      clearErr('message');
    }

    return ok;
  };

  /* Live inline validation */
  [nameEl, emailEl, subjectEl, msgEl].forEach(el => {
    el && el.addEventListener('blur', validate);
  });

  submitBtn.addEventListener('click', () => {
    if (!validate()) return;

    /* Show loading state */
    const btnText = qs('.cf-btn-text', submitBtn);
    const btnIcon = qs('.cf-btn-icon', submitBtn);
    const btnLoad = qs('.cf-btn-load', submitBtn);

    btnText.textContent      = 'Sending…';
    if (btnIcon) btnIcon.style.display = 'none';
    if (btnLoad) btnLoad.style.display = '';
    submitBtn.disabled = true;

    /*
     * ═══════════════════════════════════════════════════════
     * EDIT: Replace the setTimeout below with your actual
     * form-submission logic, e.g.:
     *
     * fetch('https://formspree.io/f/YOUR_ID', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({
     *     name:    nameEl.value,
     *     email:   emailEl.value,
     *     subject: subjectEl.value,
     *     message: msgEl.value,
     *   })
     * }).then(() => onSuccess()).catch(() => onError());
     * ═══════════════════════════════════════════════════════
     */
    setTimeout(() => {
      // Simulate success
      btnText.textContent = 'Send Message';
      if (btnIcon) btnIcon.style.display = '';
      if (btnLoad) btnLoad.style.display = 'none';
      submitBtn.disabled  = false;

      successEl.style.display = 'flex';
      [nameEl, emailEl, subjectEl, msgEl].forEach(el => { if (el) el.value = ''; });

      setTimeout(() => { successEl.style.display = 'none'; }, 6000);
    }, 1800);
  });
})();

/* ─────────────────────────────────────────────────────────────
   18. BACK-TO-TOP BUTTON
───────────────────────────────────────────────────────────── */
(function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ─────────────────────────────────────────────────────────────
   19. DARK / LIGHT MODE TOGGLE
───────────────────────────────────────────────────────────── */
(function initThemeToggle() {
  const btn  = qs('#themeToggle');
  const icon = qs('#themeIcon');
  const root = document.documentElement;
  if (!btn) return;

  const STORAGE_KEY = 'portfolio-theme';

  // Apply saved or system preference
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  const apply = theme => {
    root.dataset.theme = theme;
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    localStorage.setItem(STORAGE_KEY, theme);
  };

  apply(initialTheme);

  btn.addEventListener('click', () => {
    const newTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(newTheme);

    // Smooth flash transition
    root.style.transition = 'background 0.4s, color 0.4s';
    setTimeout(() => { root.style.transition = ''; }, 500);
  });
})();

/* ─────────────────────────────────────────────────────────────
   20. KONAMI CODE EASTER EGG
───────────────────────────────────────────────────────────── */
(function initKonamiCode() {
  const KONAMI = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a',
  ];
  let idx = 0;

  const overlay    = qs('#easterOverlay');
  const closeEgg   = qs('#easterClose');
  if (!overlay) return;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[idx]) {
      idx++;
      if (idx === KONAMI.length) {
        idx = 0;
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        // Confetti burst
        launchConfetti();
      }
    } else {
      idx = 0;
    }
  });

  closeEgg && closeEgg.addEventListener('click', () => {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  /* ── Mini confetti burst ── */
  function launchConfetti() {
    const canvas   = document.createElement('canvas');
    const duration = 3000;
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9001;';
    document.body.appendChild(canvas);
    const ctx2 = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height - canvas.height,
      w:    Math.random() * 10 + 5,
      h:    Math.random() * 8  + 4,
      r:    Math.random() * Math.PI * 2,
      dr:   (Math.random() - 0.5) * 0.15,
      vy:   Math.random() * 4 + 2,
      vx:   (Math.random() - 0.5) * 2,
      c:    `hsl(${Math.random() * 360}, 90%, 60%)`,
    }));

    const start = performance.now();
    const drawConf = now => {
      if (now - start > duration) { canvas.remove(); return; }
      ctx2.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.r += p.dr;
        ctx2.save();
        ctx2.translate(p.x, p.y);
        ctx2.rotate(p.r);
        ctx2.fillStyle = p.c;
        ctx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx2.restore();
      });
      requestAnimationFrame(drawConf);
    };
    requestAnimationFrame(drawConf);
  }
})();

/* ─────────────────────────────────────────────────────────────
   21. SMOOTH ANCHOR SCROLLING
───────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  const NAV_H = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '70', 10);

  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = qs(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_H - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   22. MOUSE-FOLLOW GLOW EFFECT
───────────────────────────────────────────────────────────── */
(function initMouseGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 0;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle at center, rgba(91,127,255,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.4s;
    top: 0; left: 0;
  `;
  document.body.appendChild(glow);

  let glowX = 0, glowY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  const moveGlow = () => {
    glowX = lerp(glowX, targetX, 0.08);
    glowY = lerp(glowY, targetY, 0.08);
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(moveGlow);
  };
  moveGlow();

  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
})();

/* ─────────────────────────────────────────────────────────────
   23. SECTION BACKGROUND ALTERNATION (subtle entrance glow)
───────────────────────────────────────────────────────────── */
(function initSectionGlow() {
  if (typeof gsap === 'undefined') return;

  qsa('.section').forEach(sec => {
    gsap.fromTo(sec, { backgroundPositionY: '0%' }, {
      backgroundPositionY: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: sec,
        start: 'top bottom',
        end:   'bottom top',
        scrub: true,
      },
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   24. TIMELINE ANIMATED SPINE DRAW
───────────────────────────────────────────────────────────── */
(function initTimelineSpine() {
  const spine = qs('.tl-spine');
  if (!spine) return;

  spine.style.transformOrigin = 'top';
  spine.style.scaleY = 0;

  if (typeof gsap !== 'undefined') {
    gsap.to(spine, {
      scaleY: 1,
      ease: 'none',
      duration: 1.5,
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top 80%',
        end:   'bottom 60%',
        scrub: true,
      },
    });
  }
})();

/* ─────────────────────────────────────────────────────────────
   25. EXPERIENCE TIMELINE SPINE (same but left-side line)
───────────────────────────────────────────────────────────── */
(function initExpSpine() {
  if (typeof gsap === 'undefined') return;
  const wrap = qs('.exp-timeline');
  if (!wrap) return;

  // Animate each exp-item in sequence
  qsa('.exp-item').forEach((item, i) => {
    gsap.from(item, {
      opacity: 0,
      x: -30,
      duration: 0.7,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        once: true,
      },
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   26. STAT CARDS HOVER GLOW PULSE
───────────────────────────────────────────────────────────── */
(function initStatHover() {
  qsa('.stat-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = `0 0 30px var(--glow), 0 8px 32px rgba(91,127,255,0.2)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = '';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   27. ACHIEVEMENT CARDS EMOJI HOVER BOUNCE
───────────────────────────────────────────────────────────── */
(function initAchHover() {
  qsa('.ach-card').forEach(card => {
    const emoji = card.querySelector('.ach-emoji');
    if (!emoji) return;
    card.addEventListener('mouseenter', () => {
      emoji.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      emoji.style.transform  = 'scale(1.35) rotate(-5deg)';
    });
    card.addEventListener('mouseleave', () => {
      emoji.style.transform = 'scale(1) rotate(0deg)';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   28. KEYBOARD NAVIGATION SUPPORT (a11y)
───────────────────────────────────────────────────────────── */
(function initA11y() {
  // Make .proj-card keyboard focusable for quick-view
  qsa('.proj-card').forEach(card => {
    if (!card.getAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const btn = card.querySelector('.proj-view-btn');
        btn && btn.click();
      }
    });
  });

  // ESC closes modals (already handled in modal section)
})();

/* ─────────────────────────────────────────────────────────────
   29. FLOATING BADGES MOUSE PARALLAX
───────────────────────────────────────────────────────────── */
(function initBadgeParallax() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const hero    = qs('.hero');
  const badges  = qsa('.float-badge');
  if (!hero || !badges.length) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const cx   = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy   = (e.clientY - rect.top)  / rect.height - 0.5;

    badges.forEach((b, i) => {
      const depth = (i + 1) * 8;
      b.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
    });
  });

  hero.addEventListener('mouseleave', () => {
    badges.forEach(b => { b.style.transform = ''; });
  });
})();

/* ─────────────────────────────────────────────────────────────
   30. PROFILE IMAGE HOVER GLOW INTENSIFY
───────────────────────────────────────────────────────────── */
(function initProfileGlow() {
  const wrap = qs('.hero-img-wrap');
  if (!wrap) return;

  wrap.addEventListener('mouseenter', () => {
    const ph = wrap.querySelector('.profile-placeholder');
    if (ph) ph.style.boxShadow = '0 0 100px var(--glow), 0 0 200px var(--glow-2)';
  });
  wrap.addEventListener('mouseleave', () => {
    const ph = wrap.querySelector('.profile-placeholder');
    if (ph) ph.style.boxShadow = '';
  });
})();

/* ─────────────────────────────────────────────────────────────
   INIT LOG
───────────────────────────────────────────────────────────── */
console.log(
  '%c🚀 Portfolio Loaded! %cBuilt with passion & lots of ☕',
  'color:#5b7fff; font-size:16px; font-weight:800;',
  'color:#9b7de8; font-size:13px;'
);
console.log(
  '%c💡 Tip: Try the Konami Code — ↑↑↓↓←→←→BA',
  'color:#7dd9d1; font-size:12px;'
);