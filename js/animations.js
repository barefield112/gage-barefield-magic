/* ---------------------------------------------
   Gage Barefield — Site Interactions
   All scroll/reveal/nav animation logic lives here
   so every page behaves identically.
--------------------------------------------- */

(function () {
  'use strict';

  /* Fade-up reveal on scroll */
  function initFadeUp() {
    var targets = document.querySelectorAll('.fade-up');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* Sticky nav gains a hairline + shadow once the page scrolls */
  function initNavScrollState() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;

    function update() {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* Mobile menu toggle */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var mobile = document.getElementById('navMobile');
    if (!toggle || !mobile) return;

    toggle.addEventListener('click', function () {
      var isOpen = mobile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobile.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Dropdown menu also opens on tap for touch devices without hover */
  function initDropdown() {
    var dropdown = document.querySelector('.site-nav__dropdown');
    if (!dropdown) return;
    var trigger = dropdown.querySelector('.site-nav__link--dropdown');
    if (!trigger) return;

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var isOpen = dropdown.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* "Read more" toggle for testimonial quotes that overflow their clamp */
  function initTestimonials() {
    var cards = document.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    function setup() {
      cards.forEach(function (card) {
        var quote = card.querySelector('.testimonial-card__quote');
        var toggle = card.querySelector('.testimonial-card__toggle');
        if (!quote || !toggle) return;

        if (quote.scrollHeight > quote.clientHeight + 2) {
          toggle.hidden = false;
        }

        toggle.addEventListener('click', function () {
          var expanded = quote.classList.toggle('is-expanded');
          toggle.textContent = expanded ? 'Read Less' : 'Read More';
        });
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setup);
    } else {
      setup();
    }
  }

  /* Buttons fill outward from wherever the cursor enters, via
     --fill-x/--fill-y read by the ::before circle in styles.css */
  function initButtonFill() {
    var targets = document.querySelectorAll('.btn, .site-nav__cta');
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.addEventListener('mouseenter', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--fill-x', (e.clientX - rect.left) + 'px');
        el.style.setProperty('--fill-y', (e.clientY - rect.top) + 'px');
      });

      el.addEventListener('focus', function () {
        if (el.style.getPropertyValue('--fill-x')) return;
        el.style.setProperty('--fill-x', '50%');
        el.style.setProperty('--fill-y', '50%');
      });
    });
  }

  /* CTA background photo brightens in a soft radius around the cursor,
     via --spot-x/--spot-y read by the mask-image on ::before in styles.css */
  function initCtaSpotlight() {
    var targets = document.querySelectorAll('.cta-banner--image');
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--spot-x', (e.clientX - rect.left) + 'px');
        el.style.setProperty('--spot-y', (e.clientY - rect.top) + 'px');
      });

      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--spot-x', '-9999px');
        el.style.setProperty('--spot-y', '-9999px');
      });
    });
  }

  /* Hero heading swipes up through each event type — a masked window with
     a stacked track of words that slides on an interval. The first word is
     duplicated at the end of the track so the loop back to the top can
     swipe smoothly instead of jumping. */
  function initHeroSwipe() {
    var track = document.querySelector('[data-swipe]');
    if (!track) return;

    var words = track.querySelectorAll('.hero__cycle-word');
    if (words.length < 2) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.transition = 'none';
      return;
    }

    var HOLD_MS = 2600;
    var SWIPE_MS = 900;

    var clone = words[0].cloneNode(true);
    track.appendChild(clone);

    var index = 0;
    var total = words.length;

    function goToNext() {
      index++;
      /* 1.2em per step must match .hero__cycle-word's height in styles.css */
      track.style.transform = 'translateY(-' + (index * 1.2) + 'em)';

      if (index === total) {
        setTimeout(function () {
          track.style.transition = 'none';
          track.style.transform = 'translateY(0)';
          track.offsetHeight; /* force reflow before restoring the transition */
          track.style.transition = '';
          index = 0;
        }, SWIPE_MS);
      }
    }

    setInterval(goToNext, HOLD_MS);
  }

  /* Reusable scroll parallax — drifts any [data-parallax] element a few
     px as the page scrolls, e.g. the hero slideshow's two .hero__slide
     layers (see the "Parallax utility" section in styles.css for the
     markup/CSS contract). Add data-parallax to any similarly-buffered
     element to reuse it elsewhere; tune with data-parallax-speed (0–1,
     default 0.15) and data-parallax-max (px, default 24). */
  function initParallax() {
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var items = [];

    function measure() {
      /* Reset first so a prior scroll-driven transform doesn't get
         baked into the measured position (getBoundingClientRect
         reflects transforms, and transforms would otherwise compound
         on every remeasure). */
      els.forEach(function (el) { el.style.transform = 'none'; });

      items = Array.prototype.map.call(els, function (el) {
        var rect = el.getBoundingClientRect();
        return {
          el: el,
          speed: parseFloat(el.getAttribute('data-parallax-speed')) || 0.15,
          max: parseFloat(el.getAttribute('data-parallax-max')) || 24,
          baseTop: rect.top + window.scrollY
        };
      });

      update();
    }

    var ticking = false;

    function update() {
      var scrollY = window.scrollY;

      items.forEach(function (item) {
        var currentTop = item.baseTop - scrollY;
        var offset = Math.max(-item.max, Math.min(item.max, -currentTop * item.speed));
        item.el.style.transform = 'translate3d(0, ' + offset.toFixed(1) + 'px, 0)';
      });

      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFadeUp();
    initNavScrollState();
    initMobileNav();
    initDropdown();
    initTestimonials();
    initButtonFill();
    initCtaSpotlight();
    initHeroSwipe();
    initParallax();
  });
})();
