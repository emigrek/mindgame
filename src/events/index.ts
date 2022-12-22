import { Event } from "../interfaces";
import { ready } from "./ready";
import { guildCreate } from "./guildCreate";
import { guildDelete } from "./guildDelete";
import { interactionCreate } from "./interactionCreate";
import { userAvatarUpdate } from "./userAvatarUpdate";
import { userUsernameUpdate } from "./userUsernameUpdate";
import { userDiscriminatorUpdate } from "./userDiscriminatorUpdate";
import { guildMemberEntered } from "./guildMemberEntered";
import { userLeveledUp } from "./userLeveledUp";
import { daily } from "./daily";
import { weekly } from "./weekly";
import { monthly } from "./monthly";
import { guildMemberOnline } from "./guildMemberOnline";
import { guildMemberOffline } from "./guildMemberOffline";


const events: Event[] = [
    ready,
    guildCreate,
    guildDelete,
    interactionCreate,
    userAvatarUpdate,
    userUsernameUpdate,
    userDiscriminatorUpdate,
    userLeveledUp,
    guildMemberEntered,
    daily,
    weekly,
    monthly,
    guildMemberOnline,
    guildMemberOffline
];

export default events;