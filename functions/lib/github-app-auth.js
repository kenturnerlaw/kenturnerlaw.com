/**
 * GitHub App auth for Cloudflare Pages Functions (Web Crypto).
 * Handles GitHub's PKCS#1 RSA PRIVATE KEY PEMs.
 */

function concatBytes(chunks) {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function encodeDerTlv(tag, content) {
  const len = content.length;
  let lenBytes;
  if (len < 0x80) {
    lenBytes = new Uint8Array([len]);
  } else if (len < 0x100) {
    lenBytes = new Uint8Array([0x81, len]);
  } else if (len < 0x10000) {
    lenBytes = new Uint8Array([0x82, (len >> 8) & 0xff, len & 0xff]);
  } else {
    lenBytes = new Uint8Array([
      0x83,
      (len >> 16) & 0xff,
      (len >> 8) & 0xff,
      len & 0xff,
    ]);
  }
  return concatBytes([new Uint8Array([tag]), lenBytes, content]);
}

function pkcs1ToPkcs8(pkcs1Bytes) {
  const version = new Uint8Array([0x02, 0x01, 0x00]);
  const algorithmIdentifier = new Uint8Array([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  ]);
  const privateKeyOctetString = encodeDerTlv(0x04, pkcs1Bytes);
  return encodeDerTlv(0x30, concatBytes([version, algorithmIdentifier, privateKeyOctetString]));
}

function pemToPkcs8Bytes(pem) {
  const trimmed = String(pem).trim();
  let body = '';
  let isPkcs1 = false;
  if (trimmed.includes('-----BEGIN PRIVATE KEY-----')) {
    body = trimmed
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s+/g, '');
  } else if (trimmed.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    isPkcs1 = true;
    body = trimmed
      .replace('-----BEGIN RSA PRIVATE KEY-----', '')
      .replace('-----END RSA PRIVATE KEY-----', '')
      .replace(/\s+/g, '');
  } else {
    throw new Error('Unsupported private key PEM.');
  }
  const decoded = atob(body);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i += 1) bytes[i] = decoded.charCodeAt(i);
  return isPkcs1 ? pkcs1ToPkcs8(bytes) : bytes;
}

function b64url(bytes) {
  let str = '';
  const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  for (let i = 0; i < arr.length; i += 1) str += String.fromCharCode(arr[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64urlJson(obj) {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}

async function appJwt(appId, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlJson({ alg: 'RS256', typ: 'JWT' });
  const payload = b64urlJson({
    iat: now - 60,
    exp: now + 9 * 60,
    iss: String(appId),
  });
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8Bytes(privateKeyPem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(data),
  );
  return `${data}.${b64url(sig)}`;
}

async function githubFetch(token, method, apiPath, body) {
  const res = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'kenturnerlaw-publish',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { message: text };
  }
  if (!res.ok) {
    const err = new Error(data.message || `GitHub API ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function installationAccessToken({ appId, privateKey, installationId }) {
  const jwt = await appJwt(appId, privateKey);
  const data = await githubFetch(
    jwt,
    'POST',
    `/app/installations/${installationId}/access_tokens`,
    { permissions: { contents: 'write', metadata: 'read' } },
  );
  return data.token;
}

export { githubFetch, appJwt };
