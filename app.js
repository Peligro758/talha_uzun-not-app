// app.js — arayüz mantığı. Vanilla, build adımı yok.

import {
  CATEGORIES,
  CATEGORY_LABELS,
  newUlid,
  openDb,
  allNotes,
  putNote,
  deleteNote,
  getNote,
  allBriefings,
  getBriefing,
  putBriefing,
  getKnownSubs,
  addKnownSub,
  exportAll,
  importData,
  seedIfEmpty,
} from "./db.js";
import { buildPayload, todayStr } from "./brifing.js";
import { SEED } from "./seed.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

// --- Yardımcılar: toast + modal onay -------------------------------------
let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 2600);
}

function confirmModal(msg, okLabel = "Tamam") {
  return new Promise((resolve) => {
    const modal = $("#modal");
    $("#modal-msg").textContent = msg;
    $("#modal-ok").textContent = okLabel;
    modal.classList.remove("hidden");
    const cleanup = (val) => {
      modal.classList.add("hidden");
      $("#modal-ok").onclick = null;
      $("#modal-cancel").onclick = null;
      resolve(val);
    };
    $("#modal-ok").onclick = () => cleanup(true);
    $("#modal-cancel").onclick = () => cleanup(false);
  });
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// --- Sekmeler -------------------------------------------------------------
function setupTabs() {
  $$(".tab").forEach((btn) => {
    btn.onclick = () => {
      $$(".tab").forEach((b) => b.classList.remove("active"));
      $$(".view").forEach((v) => v.classList.remove("active"));
      btn.classList.add("active");
      $(`#view-${btn.dataset.view}`).classList.add("active");
      if (btn.dataset.view === "brief") renderArchive();
      if (btn.dataset.view === "settings") renderSubsOverview();
    };
  });
}

// --- Alt-kategori datalist -----------------------------------------------
async function refreshSubsDatalist() {
  const subs = await getKnownSubs();
  const cat = $("#f-category").value;
  const list = $("#subs-list");
  list.innerHTML = (subs[cat] || [])
    .map((s) => `<option value="${escapeHtml(s)}"></option>`)
    .join("");
}

// --- Not formu ------------------------------------------------------------
function resetForm() {
  $("#note-id").value = "";
  $("#f-subcategory").value = "";
  $("#f-reminder").value = "";
  $("#f-text").value = "";
  $("#form-title").textContent = "Yeni not";
  $("#save-btn").textContent = "Ekle";
  $("#cancel-edit").classList.add("hidden");
}

async function onSubmitNote(e) {
  e.preventDefault();
  const id = $("#note-id").value;
  const category = $("#f-category").value;
  const subcategory = $("#f-subcategory").value.trim();
  const reminder = $("#f-reminder").value || null;
  const text = $("#f-text").value.trim();

  if (!subcategory) return toast("Alt-kategori boş olamaz.");
  if (!text) return toast("Not boş olamaz.");

  // Yeni alt-kategori onayı (yazım tutarlılığı için).
  const subs = await getKnownSubs();
  if (!(subs[category] || []).includes(subcategory)) {
    const ok = await confirmModal(
      `'${subcategory}' bu kategoride yeni. Bilinenlere ekleyeyim mi?`,
      "Ekle"
    );
    if (!ok) return; // vazgeçildi
    await addKnownSub(category, subcategory);
  }

  if (id) {
    const existing = await getNote(id);
    await putNote({ ...existing, category, subcategory, reminder, text });
    toast("Not güncellendi.");
  } else {
    await putNote({
      id: newUlid(),
      category,
      subcategory,
      date: todayStr(),
      reminder,
      text,
    });
    toast("Not eklendi.");
  }
  resetForm();
  await refreshSubsDatalist();
  await renderNotes();
}

async function startEdit(id) {
  const n = await getNote(id);
  if (!n) return;
  $("#note-id").value = n.id;
  $("#f-category").value = n.category;
  await refreshSubsDatalist();
  $("#f-subcategory").value = n.subcategory;
  $("#f-reminder").value = n.reminder || "";
  $("#f-text").value = n.text;
  $("#form-title").textContent = "Notu düzenle";
  $("#save-btn").textContent = "Kaydet";
  $("#cancel-edit").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function removeNote(id) {
  const ok = await confirmModal("Bu not silinsin mi?", "Sil");
  if (!ok) return;
  await deleteNote(id);
  toast("Not silindi.");
  await renderNotes();
}

// Hatırlatmayı tamamla: notu silmeden reminder'ı temizler (artık "Bugün"de çıkmaz).
async function completeReminder(id) {
  const n = await getNote(id);
  if (!n) return;
  await putNote({ ...n, reminder: null });
  toast("Hatırlatma tamamlandı.");
  await renderNotes();
}

// --- Not listesi ----------------------------------------------------------
async function renderNotes() {
  const notes = await allNotes();
  const q = $("#search").value.trim().toLowerCase();
  const catFilter = $("#filter-category").value;
  const today = todayStr();

  let filtered = notes;
  if (catFilter) filtered = filtered.filter((n) => n.category === catFilter);
  if (q) {
    filtered = filtered.filter((n) =>
      (n.text + " " + n.subcategory).toLowerCase().includes(q)
    );
  }
  // ULID zaman-sıralı; en yeni üstte.
  filtered.sort((a, b) => b.id.localeCompare(a.id));

  const list = $("#notes-list");
  if (!filtered.length) {
    list.innerHTML = `<p class="muted empty">Not yok.</p>`;
    return;
  }
  list.innerHTML = filtered
    .map((n) => {
      const cat = CATEGORY_LABELS[n.category] || n.category;
      let remBadge = "";
      let completeBtn = "";
      if (n.reminder) {
        const overdue = n.reminder < today;
        const dueToday = n.reminder === today;
        const cls = overdue ? "overdue" : dueToday ? "due" : "";
        const tag = overdue ? " · geçti" : dueToday ? " · bugün" : "";
        remBadge = `<span class="badge ${cls}">⏰ ${n.reminder}${tag}</span>`;
        if (n.reminder <= today) {
          completeBtn = `<button class="mini ok" data-done="${n.id}">Tamamla</button>`;
        }
      }
      return `
      <div class="note">
        <div class="note-head">
          <span class="chip chip-${n.category}">${cat} · ${escapeHtml(n.subcategory)}</span>
          <span class="date">${n.date}</span>
          ${remBadge}
        </div>
        <div class="note-text">${escapeHtml(n.text)}</div>
        <div class="note-actions">
          ${completeBtn}
          <button class="mini" data-edit="${n.id}">Düzenle</button>
          <button class="mini danger" data-del="${n.id}">Sil</button>
        </div>
      </div>`;
    })
    .join("");

  list.querySelectorAll("[data-edit]").forEach((b) => {
    b.onclick = () => startEdit(b.dataset.edit);
  });
  list.querySelectorAll("[data-del]").forEach((b) => {
    b.onclick = () => removeNote(b.dataset.del);
  });
  list.querySelectorAll("[data-done]").forEach((b) => {
    b.onclick = () => completeReminder(b.dataset.done);
  });
}

// --- Brifing --------------------------------------------------------------
let lastPayload = "";

async function prepareBriefing() {
  const { payload, hasContent } = await buildPayload();
  lastPayload = payload;
  $("#payload-preview").textContent = payload;
  $("#payload-details").classList.remove("hidden");

  const status = $("#prep-status");
  status.classList.remove("hidden");

  let copied = false;
  try {
    await navigator.clipboard.writeText(payload);
    copied = true;
  } catch (_) {
    copied = false;
  }

  if (!hasContent) {
    status.innerHTML =
      "Son 7 günde not yok ve bugüne düşen hatırlatma yok — önce birkaç not ekle.";
    return;
  }
  status.innerHTML = copied
    ? "✓ Metin <b>panoya kopyalandı</b>. Şimdi claude.ai'yi aç, Cmd+V yapıştır, Enter."
    : "Panoya kopyalanamadı — aşağıdaki metni elle kopyala.";
  if (copied) openClaude();
}

function openClaude() {
  window.open("https://claude.ai/new", "_blank", "noopener");
}

async function saveBriefing() {
  const text = $("#brief-paste").value.trim();
  if (!text) return toast("Kaydedilecek brifing metni boş.");
  const today = todayStr();
  const existing = await getBriefing(today);
  if (existing) {
    const ok = await confirmModal(
      "Bugün için zaten bir brifing kayıtlı. Üzerine yazayım mı?",
      "Üzerine yaz"
    );
    if (!ok) return;
  }
  await putBriefing(today, text);
  $("#brief-paste").value = "";
  $("#brief-save-status").classList.remove("hidden");
  $("#brief-save-status").textContent = `✓ ${today} brifingi kaydedildi.`;
  toast("Brifing kaydedildi.");
  await renderArchive();
}

async function renderArchive() {
  const briefings = await allBriefings();
  briefings.sort((a, b) => b.date.localeCompare(a.date));
  const box = $("#brief-archive");
  if (!briefings.length) {
    box.innerHTML = `<p class="muted empty">Henüz brifing kaydı yok.</p>`;
    return;
  }
  box.innerHTML = briefings
    .map(
      (b) => `
      <details class="arch-item">
        <summary>${b.date}</summary>
        <div class="arch-body">${renderMarkdownLite(b.text)}</div>
      </details>`
    )
    .join("");
}

// Çok hafif markdown: ## başlık, - madde, satır sonu.
function renderMarkdownLite(md) {
  const lines = escapeHtml(md).split("\n");
  let html = "";
  let inList = false;
  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h4>${line.replace(/^##\s+/, "")}</h4>`;
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${line.replace(/^[-*]\s+/, "")}</li>`;
    } else if (line.trim() === "") {
      if (inList) { html += "</ul>"; inList = false; }
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p>${line}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

// --- Yedek ----------------------------------------------------------------
async function exportBackup() {
  const data = await exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `not-yedek-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Yedek indirildi.");
}

async function importBackup(file) {
  try {
    const obj = JSON.parse(await file.text());
    const res = await importData(obj, { merge: true });
    $("#backup-status").classList.remove("hidden");
    $("#backup-status").textContent =
      `✓ İçe aktarıldı: ${res.notes} not, ${res.briefings} brifing.`;
    toast("İçe aktarıldı.");
    await refreshSubsDatalist();
    await renderNotes();
    await renderArchive();
    await renderSubsOverview();
  } catch (err) {
    toast("Dosya okunamadı — geçerli bir JSON mu?");
  }
}

async function renderSubsOverview() {
  const subs = await getKnownSubs();
  $("#subs-overview").innerHTML = CATEGORIES.map((c) => {
    const vals = (subs[c] || []).map((s) => `<span class="chip chip-${c}">${escapeHtml(s)}</span>`).join(" ");
    return `<div class="subs-row"><b>${CATEGORY_LABELS[c]}:</b> ${vals || "<span class=\"muted\">(boş)</span>"}</div>`;
  }).join("");
}

// --- PWA service worker ---------------------------------------------------
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

// --- Başlat ---------------------------------------------------------------
async function init() {
  await openDb();
  await seedIfEmpty(SEED);

  setupTabs();
  $("#note-form").addEventListener("submit", onSubmitNote);
  $("#cancel-edit").onclick = resetForm;
  $("#f-category").addEventListener("change", refreshSubsDatalist);
  $("#search").addEventListener("input", renderNotes);
  $("#filter-category").addEventListener("change", renderNotes);

  $("#prep-btn").onclick = prepareBriefing;
  $("#open-claude").onclick = openClaude;
  $("#save-brief").onclick = saveBriefing;

  $("#export-btn").onclick = exportBackup;
  $("#import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importBackup(e.target.files[0]);
    e.target.value = "";
  });

  await refreshSubsDatalist();
  await renderNotes();
  registerSW();
}

init();
