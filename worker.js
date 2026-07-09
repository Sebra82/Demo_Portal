export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = "https://sebra82.github.io";

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(allowedOrigin, origin) });
    }

    // Origin check
    if (origin && origin !== allowedOrigin) {
      return json({ error: "Forbidden origin" }, 403, corsHeaders(allowedOrigin, origin));
    }

    // Health check
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true }, 200, corsHeaders(allowedOrigin, origin));
    }

    // Mock checkout -> returns signed token
    if (url.pathname === "/api/checkout" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const tier = body.tier;
      const amount = Number(body.amount || 0);

      if (!["saas", "dll"].includes(tier)) {
        return json({ error: "Invalid tier" }, 400, corsHeaders(allowedOrigin, origin));
      }

      const token = await signToken(
        { tier, amount, exp: Math.floor(Date.now() / 1000) + 3600 },
        env.LICENSE_SECRET
      );

      return json({ success: true, token }, 200, corsHeaders(allowedOrigin, origin));
    }

    // Authorized download from R2
    // GET /api/download?file=license_key.txt&token=...
    if (url.pathname === "/api/download" && request.method === "GET") {
      const file = url.searchParams.get("file");
      const token = url.searchParams.get("token");

      if (!file || !token) {
        return json({ error: "Missing file/token" }, 400, corsHeaders(allowedOrigin, origin));
      }

      const valid = await verifyToken(token, env.LICENSE_SECRET);
      if (!valid.ok) {
        return json({ error: "Invalid/expired token" }, 401, corsHeaders(allowedOrigin, origin));
      }

      const object = await env.PRIVATE_ASSETS.get(file);
      if (!object) {
        return json({ error: "File not found" }, 404, corsHeaders(allowedOrigin, origin));
      }

      const headers = new Headers(corsHeaders(allowedOrigin, origin));
      headers.set("Content-Type", "application/octet-stream");
      headers.set("Content-Disposition", `attachment; filename="${file}"`);
      headers.set("Cache-Control", "no-store");

      return new Response(object.body, { status: 200, headers });
    }

    return json({ error: "Not found" }, 404, corsHeaders(allowedOrigin, origin));
  },
};

function corsHeaders(allowed, origin) {
  const allow = origin === allowed ? origin : allowed;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extra },
  });
}

async function signToken(payload, secret) {
  const enc = new TextEncoder();
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const msg = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return `${msg}.${toB64Url(new Uint8Array(sig))}`;
}

async function verifyToken(token, secret) {
  try {
    const [h, b, s] = token.split(".");
    if (!h || !b || !s) return { ok: false };

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const msg = `${h}.${b}`;
    const sig = fromB64Url(s);
    const ok = await crypto.subtle.verify("HMAC", key, sig, enc.encode(msg));
    if (!ok) return { ok: false };

    const payload = JSON.parse(atob(b.replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return { ok: false };

    return { ok: true, payload };
  } catch {
    return { ok: false };
  }
}

function b64url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function toB64Url(bytes) {
  let s = "";
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64Url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
