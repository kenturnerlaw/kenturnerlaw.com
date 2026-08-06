# Ken Turner Law — kenturnerlaw.com

## AMP only

This website is **AMP-only**.

- All pages must remain valid AMP (`<html amp>`, AMP runtime, AMP components).
- Do not convert pages to non-AMP HTML, React, or other frameworks.
- New pages and edits must stay AMP-compatible unless Ken explicitly changes this rule.

## Preserve the existing design

- Styling corrections do not authorize a redesign.
- Do not invent new headers, menus, typography systems, cards, borders, backgrounds, spacing systems, or page layouts.
- Reuse the homepage's existing shared components and visual design.

## Homepage banner — every public page

**Every public HTML page must use the same top banner as the homepage.**

- Use the homepage banner markup, height, spacing, black background, hamburger icon, centered call link, and AMP behavior.
- Do not place page titles, resource links, breadcrumbs, or unrelated labels inside the banner.
- Do not create page-specific banner variations.
- Exclude only nonpublic test, utility, error, and system files.

## Hamburger menu — every public page

**Every public HTML page must use the same menu as the homepage.**

- The control must be the homepage hamburger icon (`☰`), not a text button labeled `Menu`.
- The hamburger must open the same AMP sidebar structure on every page.
- Menu order, labels, links, indentation, typography, colors, spacing, close control, and call action must be identical.
- A Home link, resource strip, inline navigation row, or page-specific menu is not an acceptable substitute.
- Never remove or replace a working menu while editing page content.

Every site menu must provide access to:

- Home
- Practice Areas
- Criminal Defense
- Florida Criminal Defense Answers
- Arrested?
- DUI
- Drug Charges
- Domestic Violence
- Felony Charges
- Misdemeanor Charges
- Traffic Offenses
- Suspended License
- Violation of Probation
- Divorce
- Time-Sharing and Parenting Plans
- Best Interests of the Child
- Reviews
- Blog
- Call (239) 400-FREE

`Save Contact` belongs with the homepage contact information and must not be repeated as a primary menu item unless Ken expressly requests it.

## Mobile-first design

- This is one mobile-first responsive website. Desktop must use the same design, content hierarchy, navigation, and visual identity as mobile, expanding naturally to the available width.
- Do not create a separate desktop presentation or desktop-specific design concept.
- Design and verify every page at phone width first.

## Typography evaluation

- Body copy remains white or near-white against the dark background.
- Supporting text remains smaller than headings and white or near-white.
- Gold headings are currently an evaluation item, not authorization to redesign the site.
- Compare gold headings against the existing homepage design before applying them broadly.
- Do not apply a new sitewide heading treatment until Ken approves it.

## Shared site components

The following are sitewide components:

- Homepage top banner
- Hamburger and AMP sidebar menu
- Footer and `~ destrier ~` mark
- Logo and branding
- Telephone number and contact information
- Downloadable contact card
- Internal resource links
- Structured data, canonical URLs, sitemap references, and AI-discovery files

When any shared component changes, update every public page where it appears unless Ken expressly limits the scope.

## Verification before reporting completion

Never report a task as complete until the result has been verified.

For every website update:

1. Verify each intended source file actually changed.
2. Verify every public HTML page uses the homepage banner.
3. Verify every public HTML page uses the same hamburger and AMP sidebar menu.
4. Verify page-specific titles and headings remain outside the shared banner and identify the correct page.
5. Verify every changed page remains valid AMP.
6. Verify internal links and downloadable files resolve.
7. Verify mobile presentation using the same responsive design served to desktop.
8. Verify Cloudflare deployed the exact GitHub commit containing the source changes.
9. Verify the live URL displays the change and the hamburger opens and closes.

Do not mark a checklist item complete merely because a file was edited. Mark it only after the specific item has been performed and verified.

## GitHub and Cloudflare

- GitHub `kenturnerlaw/kenturnerlaw.com`, branch `main`, is the durable source of truth and version history.
- Cloudflare Pages deploys the repository root as static assets with no build command unless the site architecture is intentionally changed.
- Make source edits directly in GitHub. Do not create one-use GitHub Actions workflows to perform ordinary page edits.
- A successful GitHub commit is not proof of a successful live update.
- Confirm the Cloudflare deployment log identifies the intended commit SHA and reports `Success: Assets published!`.
- After deployment, verify the live page itself rather than relying only on repository state or deployment status.

## Mobile publishing (Q&A and updates)

**Full directions:** [PUBLISH.md](./PUBLISH.md)

Publish short legal answers or updates from an iPhone without editing HTML.

`/publish/` is a discreet login page (unlisted, `noindex`). Sign in with a password or a text-message code, then post.

### One-time Cloudflare setup

In Cloudflare Pages → Settings → Environment variables (Production):

**Required**
- `GITHUB_TOKEN` — fine-grained GitHub PAT with **Contents: Read and write**

**Password login**
- `PUBLISH_PASSWORD` — change anytime by editing this variable

**Text-message login (optional)**
- `PUBLISH_PHONE` — your mobile in E.164 form (`+12395551212`)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`

### Publish from iPhone Safari

1. Open `https://www.kenturnerlaw.com/publish/`
2. Sign in (text code or password)
3. Enter title/text → **Post**

The API writes `content/posts/{slug}.json`. GitHub Action `Publish content pages` builds the AMP page, updates the answers/blog indexes, sitemap, `search/index.json`, and `llms.txt`, then Cloudflare deploys.

- Q&A URLs: `/florida-criminal-defense-answers/{slug}/`
- Updates URLs: `/updates/{slug}/`

### Desktop / CLI

```bash
npm run publish -- --title "Should I talk to police?" --body "Your answer..." --type answer --category "Police encounters" --county Collier
npm run build:content
npm run test:publish
npm run validate:amp
```

Longer body text: put a short opening paragraph first, then optional `## Heading` sections. Extra material becomes accordions so the first mobile view stays short.

## AI and accessibility

- `llms.txt` must be valid Markdown beginning with an H1 and should remain concise, accurate, and limited to important current resources.
- Use descriptive headings, visible summaries, canonical URLs, accurate structured data, and meaningful internal links.
- Preserve a valid accessibility tree. Use appropriate elements and ARIA roles, and do not add ARIA attributes that conflict with AMP-generated behavior.
