# SEO and AI Discoverability Changes

Branch: `seo-overhaul`

## Added

- Florida Criminal Defense Answers landing page
- Individual AMP answer pages addressing:
  - Talking to police
  - Vehicle searches
  - First appearance
  - Florida bond
  - What happens after a DUI arrest
- `llms.txt` identifying the firm, attorney, service area, and primary resources
- Updated XML sitemap including the new answer pages

## Technical safeguards

- Changes are isolated from `main`
- Pages use AMP boilerplate and no ordinary JavaScript
- Canonical URLs and structured data are included
- Existing live pages were not replaced in this phase

## Deployment

Review and merge pull request #1 when ready. Cloudflare Pages should deploy after merge if the production project remains connected to the `main` branch.
