// ics.js — bir nottan takvim (.ics) hatırlatması üretir. Tamamen cihazda.
// Saatliyse o saatte alarm; saatsizse tüm-gün + o gün 09:00 alarm.

import { t, catLabel } from "./i18n.js";

const pad = (n) => String(n).padStart(2, "0");

// ICS metin kaçışı (RFC 5545).
function esc(s) {
  return (s || "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function stampUTC(d) {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

// note.reminder "YYYY-MM-DD" (zorunlu), note.reminderTime "HH:MM" (ops.).
export function buildReminderIcs(note) {
  if (!note || !note.reminder) return null;
  const [y, m, d] = note.reminder.split("-");
  const ymd = `${y}${m}${d}`;
  const firstLine = (note.text || "").split("\n")[0].trim().slice(0, 60);
  const title = "🔔 " + (firstLine || catLabel(note.category));
  const desc = `${catLabel(note.category)} · ${note.subcategory}\n${note.text || ""}`;
  const uid = `${note.id || "n" + Date.now()}@talha-not-app`;
  const dtstamp = stampUTC(new Date());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Talha Uzun//Not Sistemi//TR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(desc)}`,
  ];

  let trigger;
  if (note.reminderTime) {
    const [hh, mm] = note.reminderTime.split(":");
    const start = `${ymd}T${pad(hh)}${pad(mm)}00`; // yerel (kayan) saat
    const endD = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm) + 30);
    const end =
      `${endD.getFullYear()}${pad(endD.getMonth() + 1)}${pad(endD.getDate())}` +
      `T${pad(endD.getHours())}${pad(endD.getMinutes())}00`;
    lines.push(`DTSTART:${start}`, `DTEND:${end}`);
    trigger = "-PT0M"; // etkinlik anında
  } else {
    const next = new Date(Number(y), Number(m) - 1, Number(d) + 1);
    const nextYmd = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
    lines.push(`DTSTART;VALUE=DATE:${ymd}`, `DTEND;VALUE=DATE:${nextYmd}`);
    trigger = "PT9H"; // o gün 09:00
  }

  lines.push(
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    `TRIGGER:${trigger}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );
  return lines.join("\r\n");
}

// .ics'i indir/aç. iOS Safari'de dokununca Takvim ekleme ekranı açılır.
export function downloadIcs(note) {
  const ics = buildReminderIcs(note);
  if (!ics) return false;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hatirlatma-${note.reminder}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return true;
}
