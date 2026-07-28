// sw.js — çevrimdışı çalışma için app-shell önbelleği.
// Strateji: ÖNCE AĞ, olmazsa önbellek. Böylece çevrimiçiyken her zaman güncel
// dosyalar gelir (güncelleme yaptığımızda bayat sürüm takılmaz); çevrimdışıyken
// son önbellekten çalışır. Veri IndexedDB'de olduğu için SW sadece statik dosyalar.

const CACHE = "not-app-v2";
const ASSETS = [
  ".",
  "index.html",
  "css/styles.css",
  "js/app.js",
  "js/db.js",
  "js/brifing.js",
  "js/seed.js",
  "manifest.webmanifest",
  "icons/icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Sadece kendi kaynaklarımız; claude.ai vb. dışarısı asla önbelleğe girmez.
  if (url.origin !== location.origin) return;
  if (e.request.method !== "GET") return;

  // Önce ağ; başarılıysa önbelleği tazele. Ağ yoksa önbelleğe düş.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || Promise.reject()))
  );
});
