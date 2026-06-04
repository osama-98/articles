# Articles

A multilingual (English + Arabic) static article hub. Plain HTML, CSS, and
vanilla JavaScript — **no framework, no build step**. It runs as-is on GitHub
Pages.

- English is the default language (LTR).
- Switching to Arabic flips the whole page to RTL, swaps all labels, and uses
  the Tajawal font. The choice is saved in `localStorage` and restored on
  reload.
- The homepage renders its card list from `data/articles.json`, so adding an
  article requires **no code changes**.

## Project structure

```
articles/
├─ index.html              # homepage (header, hero, dynamic card grid)
├─ assets/
│  ├─ style.css            # homepage styles (shared palette + fonts)
│  └─ app.js               # i18n, language persistence, card rendering
├─ data/
│  └─ articles.json        # the article index (single source of truth)
├─ articles/
│  └─ psr-standards/
│     ├─ en.html           # English article (LTR)
│     └─ ar.html           # Arabic article (RTL)
└─ README.md
```

## Adding a new article

1. **Create the folder and two HTML files**

   ```
   articles/<slug>/en.html
   articles/<slug>/ar.html
   ```

   Each article is a self-contained HTML file (inline CSS + fonts). Keep the
   small sticky top bar at the top of `<body>` so readers can return Home and
   jump between languages:

   ```html
   <nav class="site-topbar">
     <a class="tb-home" href="../../index.html">← Home</a>
     <a class="tb-lang" href="ar.html" lang="ar">عربي</a>
   </nav>
   ```

   (In `ar.html` the labels are `← الرئيسية` / `EN` and the link points to
   `en.html`.) The matching `.site-topbar` CSS lives inside each file's
   `<style>` block — copy it from `articles/psr-standards/`.

2. **Add one entry to `data/articles.json`**

   ```json
   {
     "id": "<slug>",
     "title":   { "en": "English Title", "ar": "العنوان بالعربية" },
     "summary": { "en": "Short English summary.", "ar": "ملخص قصير بالعربية." },
     "date": "2026-06-04",
     "tags": ["Tag1", "Tag2"],
     "paths": {
       "en": "articles/<slug>/en.html",
       "ar": "articles/<slug>/ar.html"
     }
   }
   ```

That's it — the homepage picks it up automatically (newest first by `date`).

## Running locally

Because the homepage `fetch()`es `data/articles.json`, open it over HTTP rather
than `file://`:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Enabling GitHub Pages

1. Push this repository to GitHub (public).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the **`main`** branch and the **`/ (root)`** folder, then **Save**.
5. After a minute the site is live at
   `https://<username>.github.io/<repo>/`.

No build step or workflow is required — GitHub serves the files directly.
