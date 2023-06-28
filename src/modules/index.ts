import { Module } from "@/interfaces";

import { activities } from "./activities";
import { database } from "./database";
import { presence } from "./presence";
import { timers } from "./timers";
import { ephemeralChannel } from "./ephemeralChannel";

const modules: Module[] = [
    database,
    presence,
    timers,
    activities,
    ephemeralChannel
];

export default modules;