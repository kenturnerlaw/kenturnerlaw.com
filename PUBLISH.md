# How to publish from your phone

**Page:** https://www.kenturnerlaw.com/publish/

## Every time
1. Open https://www.kenturnerlaw.com/publish/
2. Password: `4Y3asSIIVLgK7y`
3. Title → text → **Post**
4. Done. Page goes live after the content build (about 1–2 minutes).

## One-time setup (required once)
The public site needs write access to this private repo. Cursor chat deletes GitHub tokens, so set it in Cloudflare:

1. Create a fine-grained token: https://github.com/settings/personal-access-tokens/new  
   - Name: `publish`  
   - Only repository: `kenturnerlaw/kenturnerlaw.com`  
   - Contents: **Read and write**
2. Cloudflare → Pages → **kenturnerlaw** → Settings → Environment variables  
   - Name: `GITHUB_TOKEN`  
   - Value: (the token)  
   - Environment: **Production**  
   - Save / redeploy if asked

No OAuth. No Client ID. No pasting posts into Cursor.
