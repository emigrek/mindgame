import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";
import { pendingQueues, serialized } from "./serialized";

test("tasks with the same key run one at a time, in call order, even after a failure", async () => {
    const log: string[] = [];
    const task = (name: string, delay: number, fail = false) => async () => {
        log.push(`start ${name}`);
        await sleep(delay);
        log.push(`end ${name}`);
        if (fail) throw new Error(name);
        return name;
    };

    const results = await Promise.allSettled([
        serialized("a", task("1", 20, true)),
        serialized("a", task("2", 5)),
        serialized("b", task("other", 1)),
    ]);

    assert.equal(results[0].status, "rejected");
    assert.deepEqual(results[1], { status: "fulfilled", value: "2" });
    // "other" has its own key, so it doesn't wait for "a"
    assert.ok(log.indexOf("end other") < log.indexOf("end 1"));
    assert.ok(log.indexOf("end 1") < log.indexOf("start 2"));

    await sleep(0);
    assert.equal(pendingQueues(), 0);
});
