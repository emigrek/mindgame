import { Command } from "../interfaces";
import { config } from "./config";
import { commits } from "./commits";
import { color } from "./color";

const commands: Command[] = [
    config,
    commits,
    color
];

export default commands;