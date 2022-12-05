import { Module } from "../interfaces/Module";
import config from "../utils/config";
import { connect } from "mongoose";

export const database: Module = {
    name: "database",
    run: async (client) => {
        connect(config.mongoUri).then(() => console.log("[Database] Connected"));
    }
}   