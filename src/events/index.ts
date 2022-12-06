import { Event } from "../interfaces";
import { ready } from "./ready";
import { guildCreate } from "./guildCreate";
import { guildDelete } from "./guildDelete";
import { interactionCreate } from "./interactionCreate";

const events: Event[] = [
    ready,
    guildCreate,
    guildDelete,
    interactionCreate
];

export default events;