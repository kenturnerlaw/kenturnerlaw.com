# How to publish

**Page:** https://www.kenturnerlaw.com/publish/

## Sign in
Password:

```text
4Y3asSIIVLgK7y
```

That password is stored in this private repo (`functions/publish-config.js`).  
To change it: edit that file, or tell Cursor to change it.

## Post
1. Open https://www.kenturnerlaw.com/publish/  
2. Enter password → Sign in  
3. Question or Update → title → text → Post  

## Where it goes
- Question → `/florida-criminal-defense-answers/...`  
- Update → `/updates/...`  

## One GitHub token (for posting to work)
The site needs a GitHub token that can write this repo. Easiest: tell Cursor  
“put my GitHub token in publish-config”  
and paste the token in chat.  
Or set `GITHUB_TOKEN` once in Cloudflare.  
No OAuth App. No Client ID.
