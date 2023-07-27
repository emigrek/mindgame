import { Command } from "@/interfaces";

import { config } from "./config";
import { commits } from "./commits";
import { color } from "./color";
import { ranking } from "./ranking";
import { help } from "./help";
import { ephemeralChannel } from "./ephemeralChannel";
import { evalCommand } from "./eval";
import { select } from "./select";

const commands: Command[] = [
    config,
    commits,
    color,
    ranking,
    help,
    ephemeralChannel,
    evalCommand,
    select
];

export default commands;