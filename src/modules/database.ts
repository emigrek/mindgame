import { Module } from "@/interfaces";
import { keys } from "@/config";
import mongoose from "mongoose";

export const database: Module = {
    name: "database",
    run: async () => {
        mongoose.set('strictQuery', false);
        // Awaited, so modules started after this one (activity validation) find the connection ready
        await mongoose.connect(keys.mongoUri)
            .catch((err) => {
                console.error("Error while connecting to MongoDB", err);
                process.exit(1);
            });
    }
}   