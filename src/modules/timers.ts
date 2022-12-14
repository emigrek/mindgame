import { Module } from "../interfaces";
import * as cron from "node-cron";

const dailyCron = "0 0 * * *";
const weeklyCron = "0 0 * * 0";
const monthlyCron = "0 0 1 * *";

export const timers: Module = {
    name: "timers",
    run: async (client) => {
        console.log("[Timers] Loaded module");

        cron.schedule(dailyCron, () => client.emit("daily"));
        cron.schedule(weeklyCron, () => client.emit("weekly"));
        cron.schedule(monthlyCron, () => client.emit("monthly"));
    }
}   