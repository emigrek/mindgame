import assert from "node:assert/strict";
import { test } from "node:test";
import { Collection } from "discord.js";
import { adoptLegacyLevelRoles, crossesLevelThreshold } from "./thresholds";

const roles = (...list: [id: string, name: string, hexColor?: `#${string}`][]) =>
    new Collection(list.map(([id, name, hexColor = "#000000"]) => [id, { id, name, hexColor }]));

test("adopts renamed level roles and ignores unrelated numbered roles", () => {
    const ids = adoptLegacyLevelRoles(roles(
        ["a", "Level 10"],
        ["b", "Top 10"],             // ambiguous with "Level 10": the exact name wins
        ["c", "Weteran 20"],         // the only role with 20: adopted despite the custom name
        ["d", "18+"],                // no threshold 18: never touched
        ["e", "Elita 30", "#f1a64e"],
        ["f", "Top 30"],             // ambiguous with "Elita 30": the threshold color wins
        ["g", "Top 60"],
        ["h", "Klasa 60"],           // ambiguous, no exact name or color match: skipped
    ));

    assert.equal(ids.get("10"), "a");
    assert.equal(ids.get("20"), "c");
    assert.equal(ids.get("30"), "e");
    assert.equal(ids.has("60"), false);
    assert.ok(![...ids.values()].includes("b") && ![...ids.values()].includes("d"));
});

test("level 200 is not mistaken for level 20", () => {
    const ids = adoptLegacyLevelRoles(roles(["a", "Level 200"]));
    assert.equal(ids.get("200"), "a");
    assert.equal(ids.has("20"), false);
});

test("detects reached and skipped thresholds", () => {
    assert.equal(crossesLevelThreshold(9, 10), true);
    assert.equal(crossesLevelThreshold(9, 11), true);   // skipped over 10
    assert.equal(crossesLevelThreshold(10, 11), false);
    assert.equal(crossesLevelThreshold(0, 1), false);
});
