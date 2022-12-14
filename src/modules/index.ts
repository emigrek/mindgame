import { Module } from "../interfaces";
import { database } from "./database";
import { presence } from "./presence";
import { timers } from "./timers";

const modules: Module[] = [
    database,
    presence,
    timers
];

export default modules;