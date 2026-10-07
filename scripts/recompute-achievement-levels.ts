// Recomputes stored achievement levels from their payloads after level thresholds change:
// reach() only ever raises a level, so raised thresholds leave members on levels they no longer meet.
// Run after deploying the new thresholds, or the old code raises the levels back.
// Reports only by default; pass --apply to change data.
//   npx tsx scripts/recompute-achievement-levels.ts [--apply]
import "dotenv/config";
import mongoose from "mongoose";
import moment from "moment";
import { AchievementType } from "@/interfaces";
import { achievementModel } from "@/modules/achievement/model";
import { Comeback, CoordinatedAction, Host, Marathon, NightOwl, Regular, Streamer, Suss } from "@/modules/achievement/achievements";
import type { GradualAchievement } from "@/modules/achievement/structures/GradualAchievement";

const apply = process.argv.includes("--apply");

type Payload = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// The value each progress() passes to reach(), read back from the payload
const achievements: [GradualAchievement<AchievementType>, (payload: Payload) => number | undefined][] = [
    [new CoordinatedAction(), payload => payload.ms],
    [new Suss(), payload => payload.aloneMs],
    [new Streamer(), payload => payload.ms],
    [new NightOwl(), payload => payload.ms],
    [new Marathon(), payload => payload.topMs],
    [new Host(), payload => payload.days],
    [new Comeback(), payload => payload.topMs],
    [new Regular(), payload => payload.joinedAt ? moment().diff(payload.joinedAt, "months") : undefined],
];

const main = async () => {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
    await mongoose.connect(process.env.MONGO_URI);
    console.log(apply ? "Applying changes." : "Dry run, nothing is changed. Pass --apply to recompute.");

    for (const [achievement, read] of achievements) {
        const docs = await achievementModel.find({ achievementType: achievement.achievementType }, { level: 1, payload: 1 }).lean();
        let changed = 0, skipped = 0;
        for (const doc of docs) {
            const value = doc.payload ? read(doc.payload) : undefined;
            if (value === undefined) {
                skipped++;
                continue;
            }

            const level = achievement.findClosestLevelThreshold(value)?.level ?? 0;
            if (level === (doc.level ?? 0))
                continue;

            changed++;
            // Only while unchanged, so a level the running bot just reached is kept
            if (apply)
                await achievementModel.updateOne({ _id: doc._id, level: doc.level }, { level });
        }
        console.log(`${AchievementType[achievement.achievementType]}: ${changed} of ${docs.length} level(s) ${apply ? "changed" : "to change"}`
            + (skipped ? `, ${skipped} without a payload value skipped` : ""));
    }

    await mongoose.disconnect();
};

main().catch(async error => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
});
