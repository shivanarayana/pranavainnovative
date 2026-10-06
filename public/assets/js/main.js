(function () {
  "use strict";

  var doc = document.documentElement;

  // Reveal-on-scroll. Anything already on screen is shown immediately (no flicker on load);
  // the rest fades in as it scrolls into view.
  var io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("in");
                io.unobserve(entry.target);
              }
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
        )
      : null;
  document.querySelectorAll(".reveal").forEach(function (el) {
    if (io && el.getBoundingClientRect().top > window.innerHeight) {
      io.observe(el);
    } else {
      el.classList.add("in");
    }
  });
  doc.classList.add("js");

  // Header gets a shadow once the page scrolls
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Current year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // "Apply" buttons on job cards pre-fill the Job ID in the application form
  document.querySelectorAll("[data-apply]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var jobField = document.getElementById("job-id");
      if (jobField) {
        jobField.value = btn.getAttribute("data-apply");
      }
      var name = document.getElementById("full-name");
      if (name) {
        setTimeout(function () {
          name.focus({ preventScroll: true });
        }, 450);
      }
    });
  });

  // Forms compose an email in the visitor's mail app (no backend required). Webmail users
  // whose browser has no mail app get Gmail / Outlook / copy fallbacks.
  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var to = form.getAttribute("data-mailto");
      var subject = form.getAttribute("data-subject") || "Website enquiry";
      var lines = [];
      var data = new FormData(form);

      form.querySelectorAll("[name]").forEach(function (field) {
        if (field.type === "checkbox") return;
        var value = (data.get(field.name) || "").toString().trim();
        if (!value) return;
        var label = field.getAttribute("data-label") || field.name;
        if (field.getAttribute("data-subject-suffix") !== null) {
          subject += " – " + value;
        }
        lines.push(label + ": " + value);
      });

      var body = lines.join("\n") + "\n";
      var enc = encodeURIComponent;
      var webmail = {
        gmail: "https://mail.google.com/mail/?view=cm&fs=1&to=" + enc(to) + "&su=" + enc(subject) + "&body=" + enc(body),
        outlook: "https://outlook.office.com/mail/deeplink/compose?to=" + enc(to) + "&subject=" + enc(subject) + "&body=" + enc(body)
      };

      var status = form.querySelector(".form-status");
      if (status) {
        status.querySelectorAll("[data-webmail]").forEach(function (link) {
          link.href = webmail[link.getAttribute("data-webmail")];
        });
        var copy = status.querySelector("[data-copy]");
        if (copy) {
          copy.onclick = function () {
            copyText("To: " + to + "\nSubject: " + subject + "\n\n" + body, copy);
          };
        }
        status.classList.add("show");
      }

      window.location.href = "mailto:" + to + "?subject=" + enc(subject) + "&body=" + enc(body);
    });
  });

  function copyText(text, button) {
    var label = button.getAttribute("data-label") || button.textContent;
    button.setAttribute("data-label", label);
    var done = function () {
      button.textContent = "Copied ✓";
      setTimeout(function () {
        button.textContent = label;
      }, 2000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () {
        legacyCopy(text);
        done();
      });
    } else {
      legacyCopy(text);
      done();
    }
  }

  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      // Nothing more we can do; the Gmail/Outlook links remain available.
    }
    document.body.removeChild(area);
  }
})();
