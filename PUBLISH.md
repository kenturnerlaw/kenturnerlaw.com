# How to publish

**Page:** https://www.kenturnerlaw.com/publish/

Normal sign-in: **Sign in with GitHub**. No password to invent. No token to paste on the phone after setup.

---

## One-time setup (computer)

### 1. Create a GitHub OAuth App
1. Open https://github.com/settings/applications/new  
2. **Application name:** `Ken Turner Law Publish`  
3. **Homepage URL:** `https://www.kenturnerlaw.com`  
4. **Authorization callback URL:** `https://www.kenturnerlaw.com/api/auth/callback`  
5. Register  
6. Copy **Client ID**  
7. Generate and copy **Client Secret**  

### 2. Put those two values in Cloudflare
Cloudflare → Workers & Pages → **kenturnerlaw.com** → Settings → Environment variables (Production):

- `GITHUB_OAUTH_CLIENT_ID` = Client ID  
- `GITHUB_OAUTH_CLIENT_SECRET` = Client Secret  

Save / redeploy if asked.

That is copy-paste from GitHub, not a made-up site password.

---

## Every time on iPhone

1. Open https://www.kenturnerlaw.com/publish/  
2. Tap **Sign in with GitHub**  
3. Approve  
4. Choose Question or Update → title → text → **Post**  

---

## Where it goes

- **Question** → `/florida-criminal-defense-answers/...`  
- **Update** → `/updates/...`  
