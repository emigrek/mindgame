// Removes duplicates that block the unique indexes declared in src/modules/schemas.
// Run before deploying them. Reports only by default; pass --apply to change data.
//   npx tsx scripts/dedupe-for-unique-indexes.ts [--apply]
import "dotenv/config";
import mongoose from "mongoose";
import type { Collection, ObjectId } from "mongodb";

const apply = process.argv.includes("--apply");

// Raw documents of different collections
type Doc = { _id: ObjectId } & Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

interface Rule {
    collection: string;
    key: string[];
    filter?: object;
    // Picks the document to keep; the others are deleted unless merge() folds them in first
    keep: (docs: Doc[]) => Doc;
    merge?: (kept: Doc, others: Doc[]) => object;
}

const byId = (a: Doc, b: Doc) => String(a._id).localeCompare(String(b._id));
const first = (docs: Doc[]) => [...docs].sort(byId)[0];

const statisticsPaths = ["exp", "commands", "messages", "time.voice", "time.presence"];
const read = (doc: Doc, path: string): number => path.split(".").reduce<Doc | undefined>((value, key) => value?.[key], doc) as unknown as number ?? 0;

const rules: Rule[] = [
    {
        collection: "userguildstatistics",
        key: ["userId", "guildId"],
        keep: docs => [...docs].sort((a, b) => read(b, "total.exp") - read(a, "total.exp"))[0],
        // Duplicates split the member's counters between documents, so add them up
        merge: (kept, others) => {
            const set: Record<string, number> = { level: Math.max(...[kept, ...others].map(doc => doc.level ?? 0)) };
            for (const bucket of ["total", "day", "week", "month"])
                for (const path of statisticsPaths)
                    set[`${bucket}.${path}`] = [kept, ...others].reduce((sum, doc) => sum + read(doc, `${bucket}.${path}`), 0);
            return set;
        },
    },
    // Duplicate open sessions are copies of the same session: keep the earliest one
    { collection: "voiceactivities", key: ["userId", "guildId"], filter: { to: null }, keep: docs => [...docs].sort((a, b) => a.from - b.from)[0] },
    { collection: "presenceactivities", key: ["userId", "guildId"], filter: { to: null }, keep: docs => [...docs].sort((a, b) => a.from - b.from)[0] },
    { collection: "achievements", key: ["userId", "guildId", "achievementType"], keep: docs => [...docs].sort((a, b) => (b.level ?? 0) - (a.level ?? 0) || b.updatedAt - a.updatedAt)[0] },
    { collection: "users", key: ["userId"], keep: docs => [...docs].sort((a, b) => b.updatedAt - a.updatedAt)[0] },
    // The bot read and updated the first inserted guild document (findOne without sort)
    { collection: "guilds", key: ["guildId"], keep: first },
    { collection: "follows", key: ["sourceUserId", "targetUserId"], keep: first },
];

const dedupe = async (collection: Collection, rule: Rule) => {
    const groups = await collection.aggregate<{ _id: Record<string, unknown>; ids: ObjectId[] }>([
        { $match: rule.filter ?? {} },
        { $group: { _id: Object.fromEntries(rule.key.map(field => [field, `$${field}`])), ids: { $push: "$_id" }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
    ], { allowDiskUse: true }).toArray();

    let removed = 0;
    for (const group of groups) {
        const docs = await collection.find({ _id: { $in: group.ids } }).toArray() as Doc[];
        const kept = rule.keep(docs);
        const others = docs.filter(doc => String(doc._id) !== String(kept._id));
        removed += others.length;

        if (!apply) continue;
        if (rule.merge)
            await collection.updateOne({ _id: kept._id }, { $set: rule.merge(kept, others) });
        await collection.deleteMany({ _id: { $in: others.map(doc => doc._id) } });
    }

    const sample = groups.slice(0, 3).map(group => JSON.stringify(group._id)).join(", ");
    console.log(`${rule.collection}: ${groups.length} duplicated key(s), ${removed} document(s) ${apply ? "removed" : "to remove"}${sample ? ` (e.g. ${sample})` : ""}`);
};

const main = async () => {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    if (!db) throw new Error("No database connection");

    const existing = new Set((await db.listCollections().toArray()).map(({ name }) => name));
    console.log(apply ? "Applying changes." : "Dry run, nothing is changed. Pass --apply to deduplicate.");

    for (const rule of rules) {
        if (!existing.has(rule.collection)) {
            console.log(`${rule.collection}: collection not found, skipped`);
            continue;
        }
        await dedupe(db.collection(rule.collection), rule);
    }

    await mongoose.disconnect();
};

main().catch(async error => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
});
