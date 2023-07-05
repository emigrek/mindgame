import { Event } from "@/interfaces";

import { ready } from "./ready";
import { guildCreate } from "./guildCreate";
import { interactionCreate } from "./interactionCreate";
import { userAvatarUpdate } from "./userAvatarUpdate";
import { userUsernameUpdate } from "./userUsernameUpdate";
import { userDiscriminatorUpdate } from "./userDiscriminatorUpdate";
import { guildMemberAdd } from "./guildMemberAdd";
import { userLeveledUp } from "./userLeveledUp";
import { quarter } from './quarter';
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
import { userRecievedDailyReward } from "./userRecievedDailyReward";
import { yearly } from "./yearly";
import { error } from "./error";
import { messageDelete } from "./messageDelete";
import { messageDeleteBulk } from "./messageDeleteBulk";
import { messageReactionAdd } from "./messageReactionAdd";
import { messageReactionRemove } from "./messageReactionRemove";
import { userBackFromLongVoiceBreak } from "./userBackFromLongVoiceBreak";
import { guildVoiceEmpty } from "./guildVoiceEmpty";
import { minute } from "./minute";
import { channelDelete } from "./channelDelete";
import { roleUpdate } from "./roleUpdate";
import { guildMemberRemove } from "./guildMemberRemove";

const events: Event[] = [
    ready,
    guildCreate,
    interactionCreate,
    userAvatarUpdate,
    userUsernameUpdate,
    userDiscriminatorUpdate,
    userLeveledUp,
    guildMemberAdd,
    guildMemberRemove,
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
    messageCreate,
    userRecievedDailyReward,
    yearly,
    error,
    messageDelete,
    messageDeleteBulk,
    userBackFromLongVoiceBreak,
    messageReactionAdd,
    messageReactionRemove,
    quarter,
    guildVoiceEmpty,
    minute,
    channelDelete,
    roleUpdate
];

export default events;