import { Command } from "../interfaces";
import { config } from "./config";
import { commits } from "./commits";

const commands: Command[] = [
    config,
    commits
];

export default commands;