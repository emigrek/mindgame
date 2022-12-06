import { Module } from "../interfaces";
import { database } from "./database";
import { presence } from "./presence";

const modules: Module[] = [
    database,
    presence
];

export default modules;