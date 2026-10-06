import assert from "node:assert/strict";
import { test } from "node:test";
import { expToLevel, levelToExp } from "./level";

test("a level starts at its threshold and no earlier", () => {
    for (let level = 1; level <= 250; level++) {
        const threshold = levelToExp(level);
        assert.equal(expToLevel(threshold + 1), level, `just above level ${level}`);
        assert.equal(expToLevel(threshold - 1), level - 1, `just below level ${level}`);
    }
});

test("no experience is level 0", () => {
    assert.equal(expToLevel(0), 0);
});
