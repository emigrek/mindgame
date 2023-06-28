import { Module } from "@/interfaces";
import * as cron from "node-cron";

const minuteCron = "* * * * *";
const quarterCron = "*/15 * * * *";
const hourlyCron = "0 * * * *";
const dailyCron = "0 0 * * *";
const weeklyCron = "0 0 * * MON";
const monthlyCron = "0 0 1 * *";
const yearlyCron = "0 0 1 1 *";

const schedules = [
    {
        name: 'minute',
        cron: minuteCron
    },
    {
        name: 'quarter',
        cron: quarterCron
    },
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
        for (const schedule of schedules) {
            cron.schedule(schedule.cron, () => client.emit(schedule.name));
        }
    }
}   