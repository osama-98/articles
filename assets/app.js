/* =========================================================================
   Articles — homepage behaviour
   - Renders the article grid from data/articles.json
   - Toggles the whole page between English (LTR) and Arabic (RTL)
   - Persists the chosen language in localStorage
   Adding an article needs only a JSON entry + two HTML files — no edits here.
   ========================================================================= */

(function () {
  "use strict";

  var STORAGE_KEY = "articles.lang";
  var DEFAULT_LANG = "en";

  /* UI label translations (everything on the page that isn't article data). */
  var STRINGS = {
    en: {
      brand: "Articles",
      kicker: "The Library",
      title: "Articles worth keeping.",
      subtitle: "A small, curated collection of technical writing.",
      footer: "Built as a static site · Hosted on GitHub Pages",
      readMore: "Read article",
      arrow: "→"
    },
    ar: {
      brand: "مقالات",
      kicker: "المكتبة",
      title: "مقالات تستحق الاقتناء.",
      subtitle: "مجموعة صغيرة ومنتقاة من الكتابات التقنية.",
      footer: "موقع ثابت · مُستضاف على GitHub Pages",
      readMore: "اقرأ المقال",
      arrow: "←"
    }
  };

  var grid = document.getElementById("article-grid");
  var toggle = document.getElementById("lang-toggle");
  var articles = [];          // cached after first fetch
  var lang = DEFAULT_LANG;    // current language

  /* ---- Read the persisted language (falls back to English) ---- */
  function loadLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ar") return saved;
    } catch (e) { /* localStorage may be unavailable */ }
    return DEFAULT_LANG;
  }

  function saveLang(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  /* ---- Format an ISO date in the active language's locale ---- */
  function formatDate(iso) {
    var locale = lang === "ar" ? "ar-EG" : "en-US";
    var opts = { year: "numeric", month: "long", day: "numeric" };
    try {
      return new Date(iso + "T00:00:00").toLocaleDateString(locale, opts);
    } catch (e) {
      return iso;
    }
  }

  /* ---- Escape text before injecting into HTML ---- */
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---- Build one article card (anchor) for the current language ---- */
  function cardHTML(a) {
    var t = STRINGS[lang];
    var tags = (a.tags || [])
      .map(function (tag) { return '<span class="tag">' + esc(tag) + "</span>"; })
      .join("");

    return (
      '<a class="card" href="' + esc(a.paths[lang]) + '">' +
        '<div class="card__meta">' +
          '<span class="card__date">' + esc(formatDate(a.date)) + "</span>" +
        "</div>" +
        '<h2 class="card__title">' + esc(a.title[lang]) + "</h2>" +
        '<p class="card__summary">' + esc(a.summary[lang]) + "</p>" +
        '<div class="card__tags">' + tags + "</div>" +
        '<span class="card__cta">' + esc(t.readMore) +
          ' <span class="arrow">' + t.arrow + "</span></span>" +
      "</a>"
    );
  }

  /* ---- Render the full grid ---- */
  function renderGrid() {
    grid.innerHTML = articles.map(cardHTML).join("");
  }

  /* ---- Apply language to the whole document ---- */
  function applyLang() {
    var t = STRINGS[lang];

    // Direction + lang on <html>
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Swap every static UI label marked with data-i18n
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });

    // Highlight the active language in the toggle
    toggle.querySelectorAll(".lang-toggle__opt").forEach(function (opt) {
      opt.classList.toggle("is-active", opt.getAttribute("data-lang") === lang);
    });

    // Re-render cards (their content is language-dependent)
    renderGrid();
  }

  /* ---- Toggle handler ---- */
  toggle.addEventListener("click", function () {
    lang = lang === "en" ? "ar" : "en";
    saveLang(lang);
    applyLang();
  });

  /* ---- Boot: restore language, fetch data, render ---- */
  lang = loadLang();

  fetch("data/articles.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      // newest first
      articles = data.slice().sort(function (a, b) {
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
      });
      applyLang();
    })
    .catch(function (err) {
      applyLang(); // still set labels/direction
      grid.innerHTML =
        '<p style="color:var(--muted)">Could not load articles. ' +
        "Run the site over HTTP (GitHub Pages or a local server), not via file://.</p>";
      console.error("Failed to load articles.json:", err);
    });
})();
