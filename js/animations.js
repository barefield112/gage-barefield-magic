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

  document.addEventListener('DOMContentLoaded', function () {
    initFadeUp();
    initNavScrollState();
    initMobileNav();
    initDropdown();
    initTestimonials();
  });
})();
