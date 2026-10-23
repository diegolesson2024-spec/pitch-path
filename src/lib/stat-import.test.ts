import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, readStatsCsv } from "./stat-import";

test("parseCsv handles quotes, escaped quotes, CRLF and semicolons", () => {
  assert.deepEqual(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n'), [["a", "b"], ["x, y", 'say "hi"']]);
  assert.deepEqual(parseCsv("a;b\n1;2\n"), [["a", "b"], ["1", "2"]]);
});

test("readStatsCsv maps loose column names and skips bad rows with reasons", () => {
  const csv =
    "Match Date,Opposition,Mins,G,A,Total Shots,SOT,Successful passes,Total passes,Rating\n" +
    "17/10/2026,Harbourside,60,1,0,3,2,18,24,7.5\n" +
    "32/10/2026,Bad Date,60,0,0,0,0,0,0,\n" +
    "10/10/2026,Too Many,60,0,0,1,3,0,0,\n" +
    "03/10/2026,,60,0,0,0,0,0,0,\n";
  const r = readStatsCsv(csv, { dateOrder: "DMY" });
  assert.equal(r.error, null);
  assert.equal(r.rows.length, 1);
  assert.deepEqual(
    { date: r.rows[0].date, goals: r.rows[0].goals, sot: r.rows[0].shotsOnTarget, passes: r.rows[0].passesCompleted, rating: r.rows[0].rating },
    { date: "2026-10-17", goals: 1, sot: 2, passes: 18, rating: 7.5 },
  );
  assert.deepEqual(r.skipped.map((s) => s.line), [3, 4, 5]);
});

test("readStatsCsv respects month/day order and rejects future dates", () => {
  assert.equal(readStatsCsv("Date,Opponent\n10/17/2026,X\n", { dateOrder: "MDY" }).rows[0]?.date, "2026-10-17");
  const future = readStatsCsv("Date,Opponent\n2099-01-01,X\n", { dateOrder: "DMY" });
  assert.equal(future.rows.length, 0);
  assert.match(future.skipped[0].reason, /future/);
});

test("readStatsCsv explains a missing Date/Opponent header", () => {
  assert.match(readStatsCsv("Foo,Bar\n1,2\n", { dateOrder: "DMY" }).error ?? "", /Date and Opponent/);
});

test("readStatsCsv rejects negative or non-integer counts", () => {
  const r = readStatsCsv("Date,Opponent,Goals\n2026-10-01,X,-1\n2026-10-02,Y,1.5\n", { dateOrder: "DMY" });
  assert.equal(r.rows.length, 0);
  assert.equal(r.skipped.length, 2);
});
