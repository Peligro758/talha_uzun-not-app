// db.js — IndexedDB veri katmanı, ULID üreteci, şema ve içe/dışa aktarma.
// Saf istemci tarafı; sunucu yok. Tüm veri tarayıcının IndexedDB'sinde.

const DB_NAME = "not-app";
const DB_VERSION = 1;
const STORE_NOTES = "notes";
const STORE_BRIEFINGS = "briefings"; // tarihli brifing arşivi
const STORE_META = "meta"; // bilinen alt-kategoriler vb.

export const CATEGORIES = ["is", "okul", "hayat"];
export const CATEGORY_LABELS = { is: "İş", okul: "Okul", hayat: "Hayat" };

// --- ULID üreteci (kütüphanesiz, sıralanabilir, çakışmaz) -----------------
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encode(value, length) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out = CROCKFORD[value % 32] + out;
    value = Math.floor(value / 32);
  }
  return out;
}

export function newUlid() {
  const ms = Date.now();
  // 80 bit rastgelelik: iki parça
  let rand = "";
  for (let i = 0; i < 16; i++) {
    rand += CROCKFORD[Math.floor(Math.random() * 32)];
  }
  return encode(ms, 10) + rand;
}

// Yerel (UTC değil) bugün — "YYYY-MM-DD".
function localToday() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// --- Bağlantı -------------------------------------------------------------
let _db = null;

export function openDb() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_BRIEFINGS)) {
        db.createObjectStore(STORE_BRIEFINGS, { keyPath: "date" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode = "readonly") {
  return _db.transaction(store, mode).objectStore(store);
}

function reqPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Notlar ---------------------------------------------------------------
export async function allNotes() {
  await openDb();
  return reqPromise(tx(STORE_NOTES).getAll());
}

export async function putNote(note) {
  await openDb();
  return reqPromise(tx(STORE_NOTES, "readwrite").put(note));
}

export async function deleteNote(id) {
  await openDb();
  return reqPromise(tx(STORE_NOTES, "readwrite").delete(id));
}

export async function getNote(id) {
  await openDb();
  return reqPromise(tx(STORE_NOTES).get(id));
}

// --- Brifing arşivi -------------------------------------------------------
export async function allBriefings() {
  await openDb();
  return reqPromise(tx(STORE_BRIEFINGS).getAll());
}

export async function getBriefing(dateStr) {
  await openDb();
  return reqPromise(tx(STORE_BRIEFINGS).get(dateStr));
}

export async function putBriefing(dateStr, text) {
  await openDb();
  return reqPromise(
    tx(STORE_BRIEFINGS, "readwrite").put({ date: dateStr, text })
  );
}

// --- Bilinen alt-kategoriler (meta) --------------------------------------
const DEFAULT_SUBS = { is: [], okul: [], hayat: [] };

export async function getKnownSubs() {
  await openDb();
  const row = await reqPromise(tx(STORE_META).get("known_subcategories"));
  return row ? row.value : { ...DEFAULT_SUBS };
}

export async function setKnownSubs(subs) {
  await openDb();
  return reqPromise(
    tx(STORE_META, "readwrite").put({ key: "known_subcategories", value: subs })
  );
}

export async function addKnownSub(category, sub) {
  const subs = await getKnownSubs();
  if (!subs[category]) subs[category] = [];
  if (!subs[category].includes(sub)) {
    subs[category].push(sub);
    await setKnownSubs(subs);
  }
}

// --- İçe/dışa aktarma (yedek + göç) --------------------------------------
export async function exportAll() {
  const [notes, briefings, subs] = await Promise.all([
    allNotes(),
    allBriefings(),
    getKnownSubs(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
    briefings,
    known_subcategories: subs,
  };
}

// Hem eski notes.json biçimini ({notes:[...]}) hem tam yedek biçimini kabul eder.
export async function importData(obj, { merge = true } = {}) {
  await openDb();
  const notes = Array.isArray(obj.notes) ? obj.notes : [];
  const briefings = Array.isArray(obj.briefings) ? obj.briefings : [];
  const subs = obj.known_subcategories || null;

  if (!merge) {
    await Promise.all([
      reqPromise(tx(STORE_NOTES, "readwrite").clear()),
      reqPromise(tx(STORE_BRIEFINGS, "readwrite").clear()),
    ]);
  }

  let imported = 0;
  for (const n of notes) {
    // Bozuk/eksik kayıtları normalize et (elle düzenlenmiş yedekler olabilir).
    if (!n || typeof n.text !== "string" || !n.text.trim()) continue; // boş not atla
    if (!n.id) n.id = newUlid();
    if (!("reminder" in n)) n.reminder = null;
    if (!CATEGORIES.includes(n.category)) n.category = "hayat";
    if (!n.subcategory) n.subcategory = "genel";
    if (!n.date || !/^\d{4}-\d{2}-\d{2}$/.test(n.date)) n.date = localToday();
    await putNote(n);
    imported++;
  }
  for (const b of briefings) {
    if (b.date && b.text) await putBriefing(b.date, b.text);
  }
  if (subs) {
    const existing = await getKnownSubs();
    const out = { ...DEFAULT_SUBS, ...existing };
    for (const cat of CATEGORIES) {
      const set = new Set([...(out[cat] || []), ...(subs[cat] || [])]);
      out[cat] = [...set];
    }
    await setKnownSubs(out);
  }
  return { notes: imported, briefings: briefings.length };
}

// İlk açılışta bir kez: mevcut CLI verisini seed et (varsa).
export async function seedIfEmpty(seedObj) {
  const existing = await allNotes();
  const subs = await getKnownSubs();
  const subsEmpty = CATEGORIES.every((c) => (subs[c] || []).length === 0);
  if (existing.length === 0 && subsEmpty) {
    await importData(seedObj, { merge: true });
    return true;
  }
  return false;
}
