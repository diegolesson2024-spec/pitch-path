// Reads a match-stats CSV (Veo, Hudl or a hand-made spreadsheet) into match rows.
// Column names are matched loosely, so "Shots on target", "SOT" and "shots_on_target" all work.

export type ImportRow = {
  date: string; // YYYY-MM-DD
  opponent: string;
  competition: string;
  minutes: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  keyPasses: number;
  passesCompleted: number;
  passesAttempted: number;
  dribblesWon: number;
  tackles: number;
  interceptions: number;
  rating: number | null;
};

export type SkippedRow = { line: number; reason: string };

const COUNT_FIELDS = ["goals", "assists", "shots", "shotsOnTarget", "keyPasses", "passesCompleted", "passesAttempted", "dribblesWon", "tackles", "interceptions"] as const;

const ALIASES: Record<keyof ImportRow, string[]> = {
  date: ["date", "matchdate", "gamedate", "day"],
  opponent: ["opponent", "opposition", "vs", "against", "opponentteam", "awayteam"],
  competition: ["competition", "comp", "type", "matchtype", "league"],
  minutes: ["minutes", "mins", "min", "minutesplayed", "timeplayed"],
  goals: ["goals", "goal", "g", "goalsscored"],
  assists: ["assists", "assist", "a"],
  shots: ["shots", "totalshots", "shotstotal", "shotsattempted"],
  shotsOnTarget: ["shotsontarget", "ontarget", "sot", "shotsongoal"],
  keyPasses: ["keypasses", "keypass", "chancescreated", "kp"],
  passesCompleted: ["passescompleted", "passcompleted", "completedpasses", "successfulpasses", "passok", "passesok", "accuratepasses"],
  passesAttempted: ["passesattempted", "passattempts", "totalpasses", "passes", "passestotal"],
  dribblesWon: ["dribbleswon", "dribbles", "successfuldribbles", "dribblesuccess", "takeons"],
  tackles: ["tackles", "tackleswon", "tackle"],
  interceptions: ["interceptions", "interception", "int"],
  rating: ["rating", "matchrating", "score", "playerrating"],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF). Also accepts ; or tab separators.
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const sep = [",", ";", "\t"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

function parseDate(raw: string, order: "DMY" | "MDY"): string | null {
  const s = raw.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/.exec(s);
  if (!m) return null;
  const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
  const [day, month] = order === "DMY" ? [+m[1], +m[2]] : [+m[2], +m[1]];
  return iso(year, month, day);
}

function iso(y: number, mo: number, d: number) {
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return dt.toISOString().slice(0, 10);
}

function toCount(raw: string | undefined): number | null {
  if (raw == null || raw.trim() === "" || raw.trim() === "-") return 0;
  const n = Number(raw.trim());
  return Number.isInteger(n) && n >= 0 && n <= 500 ? n : null;
}

export function readStatsCsv(text: string, opts: { dateOrder: "DMY" | "MDY"; maxRows?: number }) {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [] as ImportRow[], skipped: [] as SkippedRow[], error: "The file needs a header row and at least one match." };

  const header = table[0].map(norm);
  const col = {} as Partial<Record<keyof ImportRow, number>>;
  for (const key of Object.keys(ALIASES) as (keyof ImportRow)[]) {
    const idx = header.findIndex((h) => ALIASES[key].includes(h));
    if (idx >= 0) col[key] = idx;
  }
  if (col.date == null || col.opponent == null) {
    return { rows: [], skipped: [], error: "Couldn't find Date and Opponent columns. Use the template, or rename your columns to match it." };
  }

  const today = new Date().toISOString().slice(0, 10);
  const rows: ImportRow[] = [];
  const skipped: SkippedRow[] = [];
  const max = opts.maxRows ?? 100;

  table.slice(1).forEach((cells, i) => {
    const line = i + 2;
    if (rows.length >= max) return skipped.push({ line, reason: `Only the first ${max} matches are imported` });
    const get = (k: keyof ImportRow) => (col[k] != null ? cells[col[k]!] : undefined);

    const date = parseDate(get("date") ?? "", opts.dateOrder);
    if (!date) return skipped.push({ line, reason: `Date "${(get("date") ?? "").trim()}" isn't recognised` });
    if (date > today) return skipped.push({ line, reason: "Date is in the future" });
    const opponent = (get("opponent") ?? "").trim().slice(0, 80);
    if (!opponent) return skipped.push({ line, reason: "Opponent is missing" });

    const minutesRaw = toCount(get("minutes"));
    if (minutesRaw == null || minutesRaw > 130) return skipped.push({ line, reason: "Minutes must be a whole number up to 130" });

    const counts = {} as Record<(typeof COUNT_FIELDS)[number], number>;
    for (const f of COUNT_FIELDS) {
      const v = toCount(get(f));
      if (v == null) return skipped.push({ line, reason: `${f} must be a whole number (0-500)` });
      counts[f] = v;
    }
    if (counts.shotsOnTarget > counts.shots) return skipped.push({ line, reason: "Shots on target is more than total shots" });
    if (counts.passesCompleted > counts.passesAttempted && col.passesAttempted != null) {
      return skipped.push({ line, reason: "Completed passes is more than total passes" });
    }
    if (col.passesAttempted == null) counts.passesAttempted = counts.passesCompleted;

    const ratingRaw = (get("rating") ?? "").trim();
    const rating = ratingRaw === "" ? null : Number(ratingRaw);
    if (rating != null && (!Number.isFinite(rating) || rating < 1 || rating > 10)) return skipped.push({ line, reason: "Rating must be between 1 and 10" });

    const comp = (get("competition") ?? "").trim();
    rows.push({
      date,
      opponent,
      competition: ["League", "Cup", "Friendly", "Tournament"].find((c) => c.toLowerCase() === comp.toLowerCase()) ?? (comp ? "Friendly" : "League"),
      minutes: minutesRaw,
      ...counts,
      rating: rating == null ? null : Math.round(rating * 10) / 10,
    });
  });

  return { rows, skipped, error: rows.length ? null : "No matches could be read from this file." };
}

// Families can download a ready-made template: public/match-stats-template.csv
