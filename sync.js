// sync.js — cihazlar arası senkron. Uçtan uca şifreli (AES-GCM, WebCrypto).
// Worker sadece şifreli veriyi saklar; birleştirme cihazda yapılır.

import { getSnapshot, mergeSnapshots, applySnapshot } from "./db.js";

const LS_URL = "not-app-sync-url";
const LS_CODE = "not-app-sync-code";
const LS_LAST = "not-app-sync-last";
const SALT = "talha-not-sync-v1";

// --- Ayar (localStorage) --------------------------------------------------
export function getConfig() {
  try {
    return {
      url: (localStorage.getItem(LS_URL) || "").trim(),
      code: (localStorage.getItem(LS_CODE) || "").trim(),
    };
  } catch (_) {
    return { url: "", code: "" };
  }
}

export function setConfig({ url, code }) {
  try {
    if (url != null) localStorage.setItem(LS_URL, url.trim());
    if (code != null) localStorage.setItem(LS_CODE, code.trim());
  } catch (_) {}
}

export function isConfigured() {
  const c = getConfig();
  return !!(c.url && c.code);
}

export function getLastSync() {
  try {
    const v = Number(localStorage.getItem(LS_LAST));
    return v || 0;
  } catch (_) {
    return 0;
  }
}
function setLastSync(ts) {
  try {
    localStorage.setItem(LS_LAST, String(ts));
  } catch (_) {}
}

// Okunabilir rastgele sync-kodu (Crockford base32, karışık harfler yok).
export function generateCode() {
  const A = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let s = "";
  for (let i = 0; i < 16; i++) {
    s += A[bytes[i] % 32];
    if (i === 3 || i === 7 || i === 11) s += "-";
  }
  return s;
}

// --- Kripto ---------------------------------------------------------------
const enc = new TextEncoder();
const dec = new TextDecoder();

function b64e(buf) {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}
function b64d(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

async function deriveKey(code) {
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(code),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode(SALT), iterations: 100000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Depo anahtarı: kodun kendisi değil, SHA-256'sının bir parçası.
async function kvKey(code) {
  const d = await crypto.subtle.digest("SHA-256", enc.encode("kv:" + code));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

async function encryptObj(obj, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(obj))
  );
  return "v1." + b64e(iv) + "." + b64e(ct);
}

async function decryptStr(str, key) {
  const parts = String(str).split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new Error("format");
  const iv = b64d(parts[1]);
  const ct = b64d(parts[2]);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(dec.decode(pt));
}

// --- Ağ -------------------------------------------------------------------
function endpoint(url, kvk) {
  const base = url.replace(/\/+$/, "");
  return `${base}/?key=${encodeURIComponent(kvk)}`;
}

async function pull(url, kvk, key) {
  const res = await fetch(endpoint(url, kvk), { method: "GET" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("http-" + res.status);
  const body = (await res.text()).trim();
  if (!body) return null;
  return decryptStr(body, key); // yanlış kod → burada patlar
}

async function push(url, kvk, key, snapshot) {
  const payload = await encryptObj(snapshot, key);
  const res = await fetch(endpoint(url, kvk), {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // basit istek → CORS preflight yok
    body: payload,
  });
  if (!res.ok) throw new Error("http-" + res.status);
}

// --- Ana senkron akışı ----------------------------------------------------
// Dönüş: {ok, reason?, notes?} . reason: not-configured | network | decrypt | error
export async function syncNow() {
  const { url, code } = getConfig();
  if (!url || !code) return { ok: false, reason: "not-configured" };

  let key, kvk;
  try {
    key = await deriveKey(code);
    kvk = await kvKey(code);
  } catch (_) {
    return { ok: false, reason: "error" };
  }

  let remote;
  try {
    remote = await pull(url, kvk, key);
  } catch (e) {
    // decrypt/format hatası → kod yanlış olabilir; ağ hatası → bağlantı.
    if (String(e.message) === "format" || e.name === "OperationError")
      return { ok: false, reason: "decrypt" };
    return { ok: false, reason: "network" };
  }

  try {
    const local = await getSnapshot();
    const merged = mergeSnapshots(local, remote);
    await applySnapshot(merged);
    await push(url, kvk, key, merged);
    setLastSync(Date.now());
    return { ok: true, notes: merged.notes.filter((n) => !n.deleted).length };
  } catch (e) {
    return { ok: false, reason: "network" };
  }
}

// Sadece bağlantı testi (URL doğru mu, Worker ayakta mı).
export async function testConnection(url) {
  try {
    const res = await fetch(endpoint(url, "healthcheck-xyz"), { method: "GET" });
    // 200 (boş) ya da 404 ikisi de "ulaşılabilir" demek.
    return res.ok || res.status === 404;
  } catch (_) {
    return false;
  }
}
