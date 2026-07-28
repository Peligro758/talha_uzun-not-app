// brifing.js — "bedava köprü" brifing mantığı.
// Notlardan payload üretir; panoya kopyalar; claude.ai'yi açar; sonucu kaydeder.
// (brifing.py + brifing_manuel.py'nin tarayıcı karşılığı.) Metinler i18n'den gelir.

import { allNotes } from "./db.js";
import { t, catLabel } from "./i18n.js";

export const WINDOW_DAYS = 7;

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtNote(n) {
  const cat = catLabel(n.category);
  let head = `- (${n.date}) [${cat}/${n.subcategory}]`;
  if (n.reminder) head += ` [${t("rem_label")}: ${n.reminder}]`;
  const body = (n.text || "").replace(/\n/g, "\n  ");
  return `${head}\n  ${body}`;
}

// Son 7 gün + bugüne düşen hatırlatmaları topla.
export async function collect() {
  const today = todayStr();
  const cutoff = parseDate(today);
  cutoff.setDate(cutoff.getDate() - WINDOW_DAYS);
  const notes = await allNotes();

  const valid = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const recent = notes
    .filter((n) => valid(n.date) && parseDate(n.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Bugüne düşen + gecikmiş (kaçırılmış) hatırlatmalar; eski tarih önce.
  const due = notes
    .filter((n) => n.reminder && n.reminder <= today)
    .sort((a, b) => a.reminder.localeCompare(b.reminder));
  return { today, recent, due };
}

export function buildUserMessage({ today, recent, due }) {
  const parts = [t("bum_date", { date: today }), ""];
  parts.push(t("bum_due_head"));
  const dueLine = (n) => {
    const s = fmtNote(n);
    return n.reminder < today ? s + t("bum_overdue", { date: n.reminder }) : s;
  };
  parts.push(due.length ? due.map(dueLine).join("\n") : t("bum_none"));
  parts.push("");
  parts.push(t("bum_recent_head", { days: WINDOW_DAYS }));
  parts.push(recent.length ? recent.map(fmtNote).join("\n") : t("bum_none"));
  return parts.join("\n");
}

// claude.ai'ye yapıştırılacak tam metin.
export async function buildPayload() {
  const data = await collect();
  const hasContent = data.recent.length > 0 || data.due.length > 0;
  const payload = t("sys_prompt") + "\n\n---\n\n" + buildUserMessage(data);
  return { payload, hasContent, ...data };
}
