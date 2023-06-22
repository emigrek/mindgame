import { Module } from "../interfaces";
import config from "../utils/config";
import mongoose from "mongoose";

export const database: Module = {
    name: "database",
    run: async () => {
        mongoose.set('strictQuery', false);
        mongoose.connect(config.mongoUri)
            .catch((err) => {
                console.error("Error while connecting to MongoDB", err);
                process.exit(1);
            });
    }
}   