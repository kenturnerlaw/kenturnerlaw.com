# How to publish (Ken Turner Law)

**Login:** https://www.kenturnerlaw.com/publish/

Quiet login page. Not in the public menu. Not indexed by search engines.

---

## Why it asks for a password

Password is the simple private lock so strangers cannot post to your site.

You can also use a **text-message code** to your phone (recommended once Twilio is set up). Password remains available as a backup.

---

## How to change the password

1. Open https://dash.cloudflare.com  
2. **Workers & Pages** → **kenturnerlaw.com**  
3. **Settings** → **Environment variables** → Production  
4. Edit `PUBLISH_PASSWORD`  
5. Save (redeploy if Cloudflare asks)

That is the new login password immediately after deploy.

---

## Text-message login (phone + code)

### What you do on the phone
1. Open https://www.kenturnerlaw.com/publish/  
2. Enter your phone number  
3. Tap **Text me a code**  
4. Enter the code from the text  
5. Tap **Sign in**  
6. Post your Question or Update  

### One-time Cloudflare setup for SMS
In Cloudflare Pages → Settings → Environment variables (Production), add:

| Name | Value |
|---|---|
| `PUBLISH_PHONE` | Your mobile number, like `+12395551212` |
| `TWILIO_ACCOUNT_SID` | From Twilio |
| `TWILIO_AUTH_TOKEN` | From Twilio |
| `TWILIO_VERIFY_SERVICE_SID` | From Twilio Verify service |
| `GITHUB_TOKEN` | GitHub fine-grained token (Contents: Read and write) |

Optional but useful: keep `PUBLISH_PASSWORD` too, so you can still sign in if SMS fails.

### Twilio (one-time)
1. Create a Twilio account  
2. Create a **Verify** service  
3. Copy Account SID, Auth Token, and Verify Service SID into Cloudflare as above  

Until those are set, the login page uses **password** instead.

---

## Password login (works now)

### One-time Cloudflare setup
| Name | Value |
|---|---|
| `PUBLISH_PASSWORD` | Any private password you choose |
| `GITHUB_TOKEN` | GitHub fine-grained token (Contents: Read and write) |

### On your iPhone
1. Open https://www.kenturnerlaw.com/publish/  
2. Sign in with password (or choose **Use password instead**)  
3. Choose **Question** or **Update**  
4. Enter title, text, optional category/county  
5. Tap **Post**

---

## Where it publishes

### Question
- Live page: `https://www.kenturnerlaw.com/florida-criminal-defense-answers/{slug}/`  
- Also listed on the Answers page and Blog  

### Update
- Live page: `https://www.kenturnerlaw.com/updates/{slug}/`  
- Also listed on `/updates/` and Blog  

`{slug}` is made from the title automatically.

---

## GitHub token (needed for either login method)

1. https://github.com/settings/personal-access-tokens/new  
2. Only repo: `kenturnerlaw/kenturnerlaw.com`  
3. Permission: **Contents → Read and write**  
4. Paste into Cloudflare as `GITHUB_TOKEN`
