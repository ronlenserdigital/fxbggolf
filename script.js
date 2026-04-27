/**
 * Fredericksburg Golf Center: site interactions
 * Navbar scroll, mobile menu, smooth scroll, form, active nav
 */

(function () {
  "use strict";

  var nav = document.querySelector(".nav");
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var navOverlay = document.getElementById("nav-overlay");
  var navClose = document.querySelector(".nav-overlay__close");
  var navLinks = document.querySelectorAll('.nav-link[data-nav]');
  var overlayLinks = document.querySelectorAll('.nav-overlay__link[href^="#"]');
  var scrollThreshold = 80;
  var navOffset = 0;

  function getHeaderHeight() {
    if (!header) return 80;
    return header.offsetHeight || 80;
  }

  /* 1) Navbar: scrollY > 80 → .scrolled */
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > scrollThreshold) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
    setActiveNav();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 2) Mobile menu */
  function setOverlayStaggerDelays() {
    var items = document.querySelectorAll(".nav-overlay__list .nav-overlay__link");
    items.forEach(function (el, i) {
      el.style.transitionDelay = 60 * i + "ms";
    });
  }

  function clearOverlayStaggerDelays() {
    document.querySelectorAll(".nav-overlay__link").forEach(function (el) {
      el.style.transitionDelay = "0ms";
    });
  }

  function openMenu() {
    if (!navOverlay || !navToggle) return;
    navOverlay.classList.add("is-open");
    navOverlay.setAttribute("aria-hidden", "false");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    setOverlayStaggerDelays();
  }

  function closeMenu() {
    if (!navOverlay || !navToggle) return;
    navOverlay.classList.remove("is-open");
    navOverlay.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    clearOverlayStaggerDelays();
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (navOverlay && navOverlay.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }
  if (navClose) {
    navClose.addEventListener("click", closeMenu);
  }
  if (navOverlay) {
    navOverlay.addEventListener("click", function (e) {
      if (e.target === navOverlay) closeMenu();
    });
  }
  document.querySelectorAll('.nav-overlay__link[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      closeMenu();
    });
  });

  /* 3) Smooth scroll with offset for fixed nav */
  function smoothScrollTo(hash) {
    var target = document.querySelector(hash);
    if (!target) return;
    navOffset = getHeaderHeight();
    var y = target.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute("href");
    if (href && href.length > 1) {
      a.addEventListener("click", function (e) {
        if (href === "#") return;
        var el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          smoothScrollTo(href);
        }
      });
    }
  });

  /* Scroll-reveal removed: content stays visible (see styles.css). */

  /* 6) Web3Forms */
  var form = document.getElementById("contact-form");
  var formSuccess = document.getElementById("form-success");
  var formError = document.getElementById("form-error");

  function showMsg(success, on) {
    if (formSuccess) {
      formSuccess.hidden = !on || !success;
    }
    if (formError) {
      formError.hidden = !on || success;
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      showMsg(true, false);

      var keyInput = document.getElementById("w3f-key");
      var accessKey = keyInput && keyInput.value;
      if (!accessKey || accessKey === "YOUR_WEB3FORMS_KEY") {
        if (formError) {
          formError.textContent = "Form is not configured. Add your Web3Forms key or call (540) 372-7888.";
          formError.hidden = false;
        }
        return;
      }

      var btn = form.querySelector(".btn-submit");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }

      var payload = {
        access_key: accessKey,
        name: (document.getElementById("name") || {}).value,
        email: (document.getElementById("email") || {}).value,
        phone: (document.getElementById("phone") || {}).value,
        service: (document.getElementById("service") || {}).value,
        message: (document.getElementById("message") || {}).value,
        subject: "Website inquiry: Fredericksburg Golf Center",
        from_name: (document.getElementById("name") || {}).value
      };

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.success) {
            if (formSuccess) formSuccess.hidden = false;
            form.reset();
          } else {
            if (formError) formError.hidden = false;
          }
        })
        .catch(function () {
          if (formError) formError.hidden = false;
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = "Send Message";
          }
        });
    });
  }

  /* 7) Active nav by scroll */
  /** Order top→bottom. Keys match [data-nav] on .nav-link (no center link for home). */
  var sectionMap = [
    { id: "home", key: null },
    { id: "services", key: "services" },
    { id: "fitting", key: "fitting" },
    { id: "about", key: "about" },
    { id: "brands", key: "about" },
    { id: "cta", key: "contact" },
    { id: "contact", key: "contact" }
  ];

  function setActiveNav() {
    navOffset = getHeaderHeight();
    var y = window.scrollY + navOffset + 2;
    var current = null;
    for (var i = sectionMap.length - 1; i >= 0; i--) {
      var el = document.getElementById(sectionMap[i].id);
      if (el && y >= el.offsetTop) {
        current = sectionMap[i].key;
        break;
      }
    }
    if (window.scrollY < 50) {
      current = null;
    }

    document.querySelectorAll(".nav-link").forEach(function (link) {
      var k = link.getAttribute("data-nav");
      if (current && k === current) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }
})();
