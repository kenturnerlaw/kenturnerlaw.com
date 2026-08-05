# How to publish (Ken Turner Law)

Use this to put a short legal Q&A or legal update on the site from your iPhone.

**Publish page:** https://www.kenturnerlaw.com/publish/

That page is for you only. It is unlisted (not in the public menu) and blocked from search engines. Publishing requires your private password.

---

## One-time setup (do this once on a computer)

### 1. Merge the lock PR (if not already merged)

https://github.com/kenturnerlaw/kenturnerlaw.com/pull/19

### 2. Create a GitHub token

1. Open: https://github.com/settings/personal-access-tokens/new  
2. Name it something like `kenturnerlaw-publish`  
3. Repository access: only `kenturnerlaw/kenturnerlaw.com`  
4. Permissions: **Contents → Read and write**  
5. Generate and copy the token

### 3. Put two secrets in Cloudflare

1. Open: https://dash.cloudflare.com  
2. **Workers & Pages** → your **kenturnerlaw.com** Pages project  
3. **Settings** → **Environment variables** → Production  
4. Add:

| Name | Value |
|---|---|
| `PUBLISH_PASSWORD` | Any private password you choose |
| `GITHUB_TOKEN` | The GitHub token from step 2 |

5. Save. Redeploy if Cloudflare asks.

Until both are set, Publish stays locked.

---

## Publish from your iPhone

1. Open https://www.kenturnerlaw.com/publish/  
2. Enter your `PUBLISH_PASSWORD` → **Unlock**  
3. Optional but useful: Share → **Add to Home Screen**  
4. Choose:
   - **Q&A** = legal question-and-answer page  
   - **Update** = short legal update  
5. Enter:
   - Title or question  
   - Answer or update text (dictate or paste from Notes)  
   - Category (optional)  
   - County (optional)  
6. Tap **Publish**

Wait a few minutes for GitHub + Cloudflare to finish. Then open the URL shown on the success message.

---

## Where it publishes

### If you chose Q&A

- **Live page:** `https://www.kenturnerlaw.com/florida-criminal-defense-answers/{slug}/`  
  Example: title `Should I talk to police?` →  
  `https://www.kenturnerlaw.com/florida-criminal-defense-answers/should-i-talk-to-police/`
- **Also listed on:**
  - https://www.kenturnerlaw.com/florida-criminal-defense-answers/ (Recently published answers)
  - https://www.kenturnerlaw.com/blog/ (when new answers exist)
  - Sitemap, search index, and `llms.txt`

### If you chose Update

- **Live page:** `https://www.kenturnerlaw.com/updates/{slug}/`
- **Also listed on:**
  - https://www.kenturnerlaw.com/updates/
  - https://www.kenturnerlaw.com/blog/
  - Sitemap, search index, and `llms.txt`

`{slug}` is made automatically from the title (lowercase, hyphens, no punctuation).

---

## What the system creates for you

You do **not** edit HTML. On publish, the system:

- Creates a valid AMP page matching the site  
- Builds the URL slug  
- Adds title + meta description  
- Adds canonical URL  
- Adds structured data + breadcrumbs  
- Adds the page to the correct index/feed  
- Updates the XML sitemap  
- Updates search data  
- Adds related internal links  
- Records published and modified dates  

---

## Tips

- **Dictate:** tap the mic on the keyboard in the text box  
- **Paste from Notes:** copy in Notes → paste into the text box  
- **Longer material:** start with a short opening paragraph, then use lines like `## Heading` for sections (those become tap-to-expand accordions)  
- **County:** optional note on that one page only — it does **not** create duplicate county pages  
- **Lock this phone:** use the Lock button on the publish page when you are done  

---

## Desktop alternative (optional)

From the repo on a computer:

```bash
npm run publish -- --title "Your title" --body "Your text" --type answer --category "DUI" --county Collier
```

Use `--type update` for a legal update.
