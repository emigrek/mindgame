import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { deleteCachedMessages } from "@/modules/ephemeral-channel";

// A run longer than a minute is skipped rather than overlapped: the experience update clears its cache
// at the start of each run, and overlapping cleanups sent duplicate deletes.
// ponytail: skipping costs that minute's EXP, add a work queue if ticks ever get that slow
const running = new Set<string>();
const once = async (job: string, run: () => Promise<unknown>) => {
    if (running.has(job)) {
        console.log(`[Minute] Previous ${job} still running, skipped`);
        return;
    }
    running.add(job);
    try {
        await run();
    } catch (e) {
        console.error(`[Minute] ${job} failed`, e);
    } finally {
        running.delete(job);
    }
};

export const minute: Event = {
    name: "minute",
    // Independent jobs: a failing or slow cleanup no longer delays or skips EXP
    run: async (client: ExtendedClient) => {
        await Promise.all([
            once("ephemeral cleanup", () => deleteCachedMessages()),
            once("experience update", () => client.experienceUpdater.update()),
        ]);
    }
}
