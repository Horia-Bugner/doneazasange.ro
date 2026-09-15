# doneazasange.ro project instructions

This folder is the canonical Codex project for the FDBS website. Make site changes here. Do not treat similarly named files in the parent workspace as authoritative.

## Product and content rules

- Preserve user-approved Romanian copy, medical eligibility criteria, terminology, and supplied assets.
- Do not independently re-verify or change medical criteria unless the user explicitly asks.
- Romanian is the published language. Preserve the RO/HU/EN structure, but do not invent unapproved translations.
- Keep donation-centre schedules and contact details editable.
- Maintain responsive navigation and footer, accessibility, SEO metadata, consent-gated analytics hooks, and compatibility with direct `file://` opening.

## Site architecture

- `index.html` is the main entry point.
- `app.js` contains routes and rendering logic.
- `styles.css` contains the core responsive design.
- `data.js` contains general site and donation-centre data.
- `county-data.js` contains the Romania and county map geometry.
- `assets/` contains approved images and downloadable documents.
- `hero-pool/` and `gallery-pool/`, when present, are user-managed daily image pools.

## FAQ workflow

- `faq-data.js` is the maintained FAQ source used by the website. Apply requested FAQ changes directly there without requiring Excel.
- `FAQ-site-updated.xlsx` is retained only as a historical archive. `FAQ-site.xlsx` and the refresh scripts are legacy material and are not required by the normal editing or publishing flow.
- The FAQ page displays questions in batches of 15.
- The optional per-question link is stored with the FAQ entry; `#/criterii` adds the `Vezi mai mult` button to that FAQ only.
- Preserve approved Romanian FAQ and medical wording unless the user explicitly requests a change.

## Image-pool workflow

- Add or remove approved images from the corresponding pool folder.
- Run `refresh-image-pools.cmd` after changing pool contents.
- Homepage and gallery selections rotate deterministically by day.

## Map behavior

- Preserve the real Romania outline and county boundaries.
- Keep centre markers within the map, tooltips visible at edges, and Bucharest represented by a four-centre cluster.
- Preserve diacritic-insensitive centre search and editable centre data.

## Verification

- For content changes, verify the generated data count and affected routes.
- For interface changes, test the relevant route at desktop and mobile widths.
- Do not discard unrelated user edits or replace approved assets.

## Before publishing

- Run `node generate-seo.cjs` after source edits to keep JSON-LD, `centre.json`, and `sitemap.xml` aligned. Commit `.seo-state.json` to preserve accurate sitemap change dates, but do not deploy it or the generator.
- Keep centre directory metadata based on the same approved source and rendered schedule information. Do not treat metadata generation as medical or schedule verification.
- Publish only actual Romanian pages until the user approves English/Hungarian translations; add hreflang only for live translated counterparts.

## Hungarian version
- The user authorized Hungarian translation and publishing on 2026-09-15. Maintain RO and HU pages together.
- Translation source: `i18n/hu.json`; generated browser dictionary: `i18n/hu.js`; shared runtime: `locale.js`.
- Run `node generate-hu.cjs` with Playwright available, then `node generate-seo.cjs` before publishing. The Hungarian generator writes 64 routes under `hu/`, including translated initial content.
- Preserve official centre names, addresses, original documents, and all approved medical values. Translate changed Romanian copy into Hungarian as well.
- Publish `locale.js`, `i18n/hu.js`, and `hu/` with the site; do not publish generators, translation source JSON, or `.seo-state.json`.

- Never use `_1MO5255` (hand holding a red heart during blood donation) as a Hungarian homepage hero. The language-specific exclusion in `applyDailyHomeHero` must survive image-pool regeneration.

- Hungarian locality names are maintained in `i18n/hu-places.json` and applied by `locale.js`. Preserve Romanian route slugs and centre identifiers; search must accept both languages.
