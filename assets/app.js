/* =========================================================================
   Articles — homepage behaviour
   - Renders the article grid from data/articles.json
   - Search + tag filtering across articles (not article content)
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
      arrow: "→",
      searchPlaceholder: "Search articles by title, topic, or tag…",
      filterAll: "All",
      noResults: "No articles match your search."
    },
    ar: {
      brand: "مقالات",
      kicker: "المكتبة",
      title: "مقالات تستحق الاقتناء.",
      subtitle: "مجموعة صغيرة ومنتقاة من الكتابات التقنية.",
      footer: "موقع ثابت · مُستضاف على GitHub Pages",
      readMore: "اقرأ المقال",
      arrow: "←",
      searchPlaceholder: "ابحث في المقالات بالعنوان أو الموضوع أو الوسم…",
      filterAll: "الكل",
      noResults: "لا توجد مقالات مطابقة لبحثك."
    }
  };

  var grid    = document.getElementById("article-grid");
  var toggle  = document.getElementById("lang-toggle");
  var search  = document.getElementById("article-search");
  var tagbar  = document.getElementById("article-tags");
  var noRes   = document.getElementById("article-noresults");

  var articles = [];          // cached after first fetch
  var lang = DEFAULT_LANG;    // current language
  var query = "";             // current search text
  var activeTag = null;       // current tag filter (null = all)

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

  /* ---- Unique tag list across all articles (stable order) ---- */
  function allTags() {
    var seen = {}, out = [];
    articles.forEach(function (a) {
      (a.tags || []).forEach(function (tag) {
        if (!seen[tag]) { seen[tag] = true; out.push(tag); }
      });
    });
    return out;
  }

  /* ---- Articles matching the current search text + active tag ---- */
  function filtered() {
    var q = query.trim().toLowerCase();
    return articles.filter(function (a) {
      var hay = (
        a.title[lang] + " " + a.summary[lang] + " " + (a.tags || []).join(" ")
      ).toLowerCase();
      var matchQ = !q || hay.indexOf(q) !== -1;
      var matchT = !activeTag || (a.tags || []).indexOf(activeTag) !== -1;
      return matchQ && matchT;
    });
  }

  /* ---- Build one article card (anchor) for the current language ---- */
  function cardHTML(a) {
    var t = STRINGS[lang];
    var tags = (a.tags || [])
      .map(function (tag) {
        var on = tag === activeTag ? " is-active" : "";
        return '<span class="tag tag--btn' + on + '" role="button" tabindex="0" data-tag="' +
          esc(tag) + '">' + esc(tag) + "</span>";
      })
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

  /* ---- Render the tag filter bar (All + one chip per tag) ---- */
  function renderTags() {
    var t = STRINGS[lang];
    var html = '<button type="button" class="f-chip' +
      (activeTag === null ? " is-active" : "") + '" data-tag="">' +
      esc(t.filterAll) + "</button>";
    html += allTags().map(function (tag) {
      var on = tag === activeTag ? " is-active" : "";
      return '<button type="button" class="f-chip' + on + '" data-tag="' +
        esc(tag) + '">' + esc(tag) + "</button>";
    }).join("");
    tagbar.innerHTML = html;
  }

  /* ---- Render the grid from the current filter ---- */
  function renderGrid() {
    var list = filtered();
    grid.innerHTML = list.map(cardHTML).join("");
    if (noRes) noRes.style.display = list.length ? "none" : "";
  }

  /* ---- Apply a tag filter (empty string = All) ---- */
  function setTag(tag) {
    activeTag = tag ? tag : null;
    renderTags();
    renderGrid();
  }

  /* ---- Apply language to the whole document ---- */
  function applyLang() {
    var t = STRINGS[lang];

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });

    if (search) search.placeholder = t.searchPlaceholder;
    if (noRes) noRes.textContent = t.noResults;

    toggle.querySelectorAll(".lang-toggle__opt").forEach(function (opt) {
      opt.classList.toggle("is-active", opt.getAttribute("data-lang") === lang);
    });

    renderTags();
    renderGrid();
  }

  /* ---- Language toggle ---- */
  toggle.addEventListener("click", function () {
    lang = lang === "en" ? "ar" : "en";
    saveLang(lang);
    applyLang();
  });

  /* ---- Search input ---- */
  if (search) {
    search.addEventListener("input", function () {
      query = search.value;
      renderGrid();
    });
  }

  /* ---- Tag bar clicks ---- */
  if (tagbar) {
    tagbar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-tag]");
      if (b) setTag(b.getAttribute("data-tag"));
    });
  }

  /* ---- Clicking a tag inside a card filters by it (no navigation) ---- */
  grid.addEventListener("click", function (e) {
    var chip = e.target.closest(".tag--btn");
    if (!chip) return;
    e.preventDefault();
    setTag(chip.getAttribute("data-tag"));
  });
  grid.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var chip = e.target.closest(".tag--btn");
    if (!chip) return;
    e.preventDefault();
    setTag(chip.getAttribute("data-tag"));
  });

  /* ---- Boot: restore language, fetch data, render ---- */
  lang = loadLang();

  fetch("data/articles.json")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      articles = data.slice().sort(function (a, b) {
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
      });
      applyLang();
    })
    .catch(function (err) {
      applyLang();
      grid.innerHTML =
        '<p style="color:var(--muted)">Could not load articles. ' +
        "Run the site over HTTP (GitHub Pages or a local server), not via file://.</p>";
      console.error("Failed to load articles.json:", err);
    });
})();
