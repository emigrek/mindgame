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
import { voiceChannelJoin } from "./voiceChannelJoin";
import { voiceChannelDeaf } from "./voiceChannelDeaf";
import { voiceChannelUndeaf } from "./voiceChannelUndeaf";
import { voiceChannelLeave } from "./voiceChannelLeave";
import { voiceChannelSwitch } from "./voiceChannelSwitch";
import { voiceStreamingStart } from "./voiceStreamingStart";
import { voiceStreamingStop } from "./voiceStreamingStop";
import { presenceUpdate } from "./presenceUpdate";
import { messageCreate } from "./messageCreate";

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
    voiceChannelJoin,
    voiceChannelDeaf,
    voiceChannelUndeaf,
    voiceChannelLeave,
    voiceChannelSwitch,
    voiceStreamingStart,
    voiceStreamingStop,
    presenceUpdate,
    messageCreate
];

export default events;