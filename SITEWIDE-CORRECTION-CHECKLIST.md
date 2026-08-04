# Sitewide Banner and Menu Correction Checklist

## Controlling rules
- [x] README states that every public page must use the homepage top banner.
- [x] README states that every public page must use the same hamburger menu.
- [x] README prohibits text buttons labeled `Menu` as a substitute for the homepage hamburger.
- [x] README states that styling corrections do not authorize redesign.
- [x] No changes beyond the specifically approved typography, menu, and Facebook-removal work.

## Approved scope — August 3, 2026
- [ ] Change the older pages' text font, heading styles, text colors, sizes, and spacing to match the newer pages.
- [ ] Use the newer hamburger menu and its exact menu text on the older pages.
- [ ] Preserve each older page's existing content, logo, images, layout, links, and functions except where specifically changed below.
- [ ] Remove the Facebook icon and Facebook link from every older public page.
- [ ] Make no other design, content, navigation, image, footer, or functional changes.

## Homepage source
- [x] Confirm the current homepage banner markup used as the source.
- [x] Confirm the current homepage hamburger and AMP sidebar markup used as the source.
- [ ] Confirm Save Contact remains beside homepage contact information and is not moved into the menu.

## Shared banner
- [ ] Apply the approved top banner to every public legacy page.
- [x] Apply the approved top banner to Best Interests of the Child.
- [x] Apply the approved top banner to the Florida Criminal Defense Answers index.
- [x] Apply the approved top banner to every Criminal Defense Answers article.
- [x] Apply the approved top banner to Practice Areas.
- [x] Apply the approved top banner to Blog.
- [x] Apply the approved top banner to Client Resources.
- [ ] Remove all page-specific banner variations.
- [ ] Remove resource-link strips, page titles, breadcrumbs, and unrelated labels from banners.

## Shared menu
- [ ] Apply the newer hamburger to every older public page.
- [ ] Remove every text button labeled `Menu`.
- [ ] Apply the newer menu's exact text, order, links, indentation, typography, colors, spacing, close control, appointment entry, payment entry, and call action to every older public page.
- [ ] Remove duplicate menus, inline navigation rows, and older page-specific menu variants.
- [ ] Confirm every hamburger target matches the AMP sidebar ID.
- [ ] Confirm every menu opens and closes at phone width.
- [ ] Confirm every menu opens and closes at desktop width.

## Typography and text styling
- [ ] Apply the newer pages' font family to every older public page.
- [ ] Apply the newer pages' H1 styling to every older public page.
- [ ] Apply the newer pages' H2 and H3 gold heading styling to every older public page.
- [ ] Apply the newer pages' body-text color and line spacing to every older public page.
- [ ] Apply the newer pages' supporting-text size and color to every older public page.
- [ ] Preserve the older pages' existing text content while changing only its approved presentation.

## Facebook removal
- [ ] Remove the Facebook icon from every older public page.
- [ ] Remove every Facebook link from every older public page.
- [ ] Confirm no Facebook SVG, label, or empty Facebook list item remains.

## Page-specific accuracy
- [ ] Confirm every page retains its own correct title and H1 outside the shared banner.
- [x] Confirm Child Custody contains no Criminal Defense Answers banner text.
- [ ] Confirm unrelated pages contain no Best Interests banner text.
- [x] Confirm every Criminal Defense Answers article retains its correct article title.
- [ ] Confirm no page displays a copied heading from another page.

## Public-page source audit
- [ ] Homepage
- [x] Practice Areas
- [ ] Criminal Defense
- [ ] Arrested
- [ ] DUI
- [ ] Drug Charges
- [ ] Domestic Violence
- [ ] Felony Charges
- [ ] Misdemeanor Charges
- [ ] Traffic Offenses
- [ ] Suspended License
- [ ] Violation of Probation
- [ ] Naples criminal-defense page
- [ ] Fort Myers criminal-defense page
- [ ] LaBelle criminal-defense page
- [ ] Miami criminal-defense page
- [ ] Divorce
- [x] Child Custody and Time-Sharing
- [x] Best Interests of the Child
- [ ] Reviews
- [x] Blog
- [x] Client Resources
- [x] Florida Criminal Defense Answers index
- [x] Every individual Criminal Defense Answers article
- [ ] Every other public HTML page found in the repository

## Technical verification
- [ ] Confirm every changed page remains valid AMP.
- [ ] Confirm `amp-sidebar` is loaded wherever required.
- [ ] Confirm one primary top banner per page.
- [ ] Confirm one primary menu per page.
- [ ] Check every menu link.
- [ ] Check telephone links.
- [ ] Check email links.
- [ ] Check appointment links.
- [ ] Check payment links.
- [ ] Check for horizontal overflow.
- [ ] Check for overlapping banner text or controls.
- [ ] Check for missing hamburger controls.

## Deployment and live verification
- [ ] Verify the final GitHub source commit.
- [ ] Verify Cloudflare deployed the exact final commit.
- [ ] Verify the live homepage banner and menu.
- [ ] Verify representative criminal-defense pages live.
- [ ] Verify representative family-law pages live.
- [ ] Verify Best Interests live.
- [ ] Verify the Criminal Defense Answers index live.
- [ ] Verify every Criminal Defense Answers article live.
- [ ] Verify the hamburger opens and closes on live mobile pages.
- [ ] Verify the hamburger opens and closes on live desktop pages.
