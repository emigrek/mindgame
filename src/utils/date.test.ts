import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDuration, formatTimeTotal, getNightMs, getWarsawDay, getWarsawHour } from "./date";

const utc = (iso: string) => new Date(`${iso}Z`);
const hours = (n: number) => n * 60 * 60 * 1000;

test("Warsaw calendar day and hour", () => {
    assert.equal(getWarsawDay(utc("2026-01-01T22:59:00")), "2026-01-01");
    assert.equal(getWarsawDay(utc("2026-01-01T23:00:00")), "2026-01-02"); // midnight in winter (UTC+1)
    assert.equal(getWarsawDay(utc("2026-07-01T22:00:00")), "2026-07-02"); // midnight in summer (UTC+2)
    assert.equal(getWarsawHour(utc("2026-03-29T00:30:00")), 1);
    assert.equal(getWarsawHour(utc("2026-03-29T01:30:00")), 3); // 2:00 doesn't exist on the spring DST day
});

test("night time between 0:00 and 5:00 Warsaw", () => {
    assert.equal(getNightMs(utc("2026-01-01T22:00:00"), utc("2026-01-02T05:00:00")), hours(5));
    assert.equal(getNightMs(utc("2026-01-02T05:00:00"), utc("2026-01-02T20:00:00")), 0);
    // Spring DST: 0:00 CET to 5:00 CEST is 4 real hours
    assert.equal(getNightMs(utc("2026-03-28T22:00:00"), utc("2026-03-29T05:00:00")), hours(4));
    // Partial hours count to the minute
    assert.equal(getNightMs(utc("2026-01-01T23:30:00"), utc("2026-01-02T00:15:00")), hours(0.75));
});

test("duration formatting", () => {
    assert.equal(formatDuration(500), "500ms");
    assert.equal(formatDuration(90_000), "1m");
    assert.equal(formatDuration(hours(1) + 5 * 60_000), "1h 5m");
    assert.equal(formatDuration(hours(25)), "1d 1h");
});

test("time totals in statistics", () => {
    assert.equal(formatTimeTotal(0), "0m");
    assert.equal(formatTimeTotal(25 * 60), "25m"); // used to round to "0H"
    assert.equal(formatTimeTotal(90 * 60), "1h 30m");
});
