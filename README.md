# doneazasange.ro — Codex project

Responsive, dependency-free website prototype for FDBS. Open `index.html` directly or serve this folder with any static web server.

The Romanian approved copy is implemented in the interface. HU/EN routing/content fields are represented in `cms-schema.json`; publication remains Romanian-first until approved translations are supplied.

## Content architecture

- Donation eligibility and process
- Searchable FAQ
- National donation-centre directory with diacritic-insensitive search, geolocation sorting, interactive markers and Google Maps handoff
- Proiecte actuale: eligibility-criteria project and Donorium
- Fixed historical gallery timeline with deterministic daily rotation
- Consent-gated analytics hooks
- SEO metadata, accessible navigation and responsive header/footer

Centre contact details and unconfirmed donor schedules intentionally remain editable CMS fields.

## Continue in Codex

Open this folder as the workspace/project root. Codex will automatically read `AGENTS.md`, which contains the durable content rules, file map, FAQ workflow, image-pool workflow and verification expectations.

### Update FAQs

Request or apply FAQ changes directly in `faq-data.js`. The site no longer depends on an Excel refresh step. `FAQ-site-updated.xlsx` remains in the repository only as a historical archive; the older workbook and refresh scripts are retained as legacy reference material.

### Update daily image pools

1. Add or remove approved photographs from the relevant pool folder.
2. Run `refresh-image-pools.cmd`.
3. Refresh the website.

### Search metadata and public centre directory

Run `node generate-seo.cjs` after editing published pages, `data.js`, `app.js`, or FAQ content and before publishing. It updates the embedded JSON-LD, `centre.json`, and `sitemap.xml` from the current source without changing visible copy. Commit `.seo-state.json` with these generated files so unchanged pages retain their sitemap dates. Do not deploy the generator or `.seo-state.json`.

`centre.json` contains 48 current public centre records with source page URLs, original schedules, contacts, notes and the schedule date displayed by the site when available. Its generation date is not a claim that a centre was contacted or verified. Incomplete hours are retained as text and omitted from structured opening-hour specifications. Centres are independent directory entries, not departments of FDBS.

Published language is Romanian. Add English and Hungarian URL variants and reciprocal hreflang only after their reviewed translations are published. Do not advertise untranslated pages as language alternatives.
