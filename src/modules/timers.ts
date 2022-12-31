import { Module } from "../interfaces";
import * as cron from "node-cron";

const hourlyCron = "0 * * * *";
const dailyCron = "0 0 * * *";
const weeklyCron = "0 0 * * 0";
const monthlyCron = "0 0 1 * *";
const yearlyCron = "0 0 1 1 *";

const schedules = [
    {
        name: "hourly",
        cron: hourlyCron
    },
    {
        name: "daily",
        cron: dailyCron
    },
    {
        name: "weekly",
        cron: weeklyCron
    },
    {
        name: "monthly",
        cron: monthlyCron
    },
    {
        name: "yearly",
        cron: yearlyCron
    }
];

export const timers: Module = {
    name: "timers",
    run: async (client) => {
        console.log("[Timers] Loaded module");

        for (const schedule of schedules) {
            cron.schedule(schedule.cron, async () => await client.emit(schedule.name));
        }
    }
}   