import { Module, User } from "../interfaces";
import config from "../utils/config";
import mongoose from "mongoose";

export const database: Module = {
    name: "database",
    run: async (client) => {
        try {
            await mongoose.connect(config.mongoUri);
            console.log("[Database] Connected to mongo");
        } catch (err) {
            console.error("[Database] Error", err);
            process.exit(1);
        }
    }
}   