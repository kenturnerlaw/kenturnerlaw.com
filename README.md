# Ken Turner Law — kenturnerlaw.com

## AMP only

This website is **AMP-only**.

- All pages must remain valid AMP (`<html amp>`, AMP runtime, AMP components).
- Do not convert pages to non-AMP HTML, React, or other frameworks.
- New pages and edits must stay AMP-compatible unless Ken explicitly changes this rule.

## Mobile-first design

- This is one mobile-first responsive website. Desktop must use the same design, content hierarchy, navigation, and visual identity as mobile, expanding naturally to the available width.
- Do not create a separate desktop presentation or desktop-specific design concept.
- Design and verify every page at phone width first.
- Use a compact branded AMP header with the horse-and-shield mark, hamburger menu, and clear call access.
- Do not use stacked bare text links as the primary menu.
- Keep the page purpose and introduction visible immediately without unnecessary preliminary content.

## Reduce client burden

- Every page and client resource must reduce cognitive load.
- Do not turn a prompt, checklist, worksheet, or short reference into a packet, journal, or assignment.
- Prefer the shortest useful form that accomplishes the stated purpose.
- Do not add corporate marketing filler, unnecessary sections, decorative clutter, or redundant instructions.
- Preserve Ken Turner's practical voice rather than generic law-firm or SEO copy.

## Shared site components

The following are sitewide components:

- Header and navigation
- Footer and `~ destrier ~` mark
- Logo and branding
- Telephone number and contact information
- Downloadable contact card
- Internal resource links
- Structured data, canonical URLs, sitemap references, and AI-discovery files

When any shared component changes, update every page where it appears unless Ken expressly limits the scope.

## Navigation requirements

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
- Save Contact

New pages must be reachable from the homepage and the site menu when published.

## Verification before reporting completion

Never report a task as complete until the result has been verified.

For every website update:

1. Verify each intended source file actually changed.
2. Verify shared components were updated everywhere they appear.
3. Verify every changed page remains valid AMP.
4. Verify internal links and downloadable files resolve.
5. Verify the page is present in the sitemap when appropriate.
6. Verify mobile presentation using the same responsive design served to desktop.
7. Verify Cloudflare deployed the exact GitHub commit containing the source changes.
8. Verify the live URL displays the change.

Do not use `complete`, `finished`, `done`, `sitewide`, or similar language when any required verification remains outstanding. State exactly what remains unverified.

## GitHub and Cloudflare

- GitHub `kenturnerlaw/kenturnerlaw.com`, branch `main`, is the durable source of truth and version history.
- Cloudflare Pages deploys the repository root as static assets with no build command unless the site architecture is intentionally changed.
- Make source edits directly in GitHub. Do not create one-use GitHub Actions workflows to perform ordinary page edits.
- A successful GitHub commit is not proof of a successful live update.
- Confirm the Cloudflare deployment log identifies the intended commit SHA and reports `Success: Assets published!`.
- After deployment, verify the live page itself rather than relying only on repository state or deployment status.

## AI and accessibility

- `llms.txt` must be valid Markdown beginning with an H1 and should remain concise, accurate, and limited to important current resources.
- Use descriptive headings, visible summaries, canonical URLs, accurate structured data, and meaningful internal links.
- Preserve a valid accessibility tree. Use appropriate elements and ARIA roles, and do not add ARIA attributes that conflict with AMP-generated behavior.
- AI-discovery work supports useful content and navigation; it does not replace them.
