import { Event } from "../interfaces";
import { ready } from "./ready";
import { guildCreate } from "./guildCreate";
import { guildDelete } from "./guildDelete";
import { interactionCreate } from "./interactionCreate";
import { userAvatarUpdate } from "./userAvatarUpdate";
import { userUsernameUpdate } from "./userUsernameUpdate";
import { userDiscriminatorUpdate } from "./userDiscriminatorUpdate";
import { guildMemberEntered } from "./guildMemberEntered";

const events: Event[] = [
    ready,
    guildCreate,
    guildDelete,
    interactionCreate,
    userAvatarUpdate,
    userUsernameUpdate,
    userDiscriminatorUpdate,
    guildMemberEntered
];

export default events;