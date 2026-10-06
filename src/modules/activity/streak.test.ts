import assert from "node:assert/strict";
import { test } from "node:test";
import { computeStreaks } from "./streak";

test("continues across the new year and DST changes", () => {
    assert.equal(computeStreaks(["2025-12-30", "2025-12-31", "2026-01-01"], "2026-01-01").streak?.value, 3);
    assert.equal(computeStreaks(["2026-03-28", "2026-03-29", "2026-03-30"], "2026-03-30").streak?.value, 3);
});

test("the same day of year a year later is not consecutive", () => {
    assert.equal(computeStreaks(["2025-03-01", "2026-03-02"], "2026-03-02").streak?.value, 1);
});

test("a streak expires after a missed day but the record stays", () => {
    const yesterday = computeStreaks(["2026-01-01", "2026-01-02"], "2026-01-03");
    assert.equal(yesterday.streak?.value, 2);

    const expired = computeStreaks(["2026-01-01", "2026-01-02"], "2026-01-05");
    assert.equal(expired.streak?.value, 0);
    assert.equal(expired.maxStreak?.value, 2);
});

test("keeps the longest streak as the record", () => {
    const { streak, maxStreak } = computeStreaks(["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-10", "2026-01-11"], "2026-01-11");
    assert.equal(streak?.value, 2);
    assert.equal(maxStreak?.value, 3);
    assert.equal(maxStreak?.startedAt.toISOString().slice(0, 10), "2026-01-01");
});

test("no voice days means no streak", () => {
    assert.deepEqual(computeStreaks([], "2026-01-01"), {});
});
