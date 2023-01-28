import { Command } from "../interfaces";
import { config } from "./config";
import { commits } from "./commits";
import { color } from "./color";
import { ranking } from "./ranking";

const commands: Command[] = [
    config,
    commits,
    color,
    ranking
];

export default commands;