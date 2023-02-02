import { Command } from "../interfaces";
import { config } from "./config";
import { commits } from "./commits";
import { color } from "./color";
import { ranking } from "./ranking";
import { help } from "./help";

const commands: Command[] = [
    config,
    commits,
    color,
    ranking,
    help
];

export default commands;