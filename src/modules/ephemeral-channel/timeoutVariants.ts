import { APIApplicationCommandOptionChoice } from "discord.js";

const timeoutVariants: APIApplicationCommandOptionChoice<number>[] = [
    {
        name: "5 minutes",
        value: 5
    },
    {
        name: "10 minutes",
        value: 10
    },
    {
        name: "15 minutes",
        value: 15
    },
    {
        name: "30 minutes",
        value: 30
    },
    {
        name: "1 hour",
        value: 60
    },
    {
        name: "6 hours",
        value: 360
    },
    {
        name: "12 hours",
        value: 720
    },
    {
        name: "1 day",
        value: 1440
    }
];

export default timeoutVariants;