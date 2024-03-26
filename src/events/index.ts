import { Event } from "@/interfaces";

import { ready } from "./ready";
import { guildCreate } from "./guildCreate";
import { interactionCreate } from "./interactionCreate";
import { userUpdate } from "./userUpdate";
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
import { userReceivedDailyReward } from "./userReceivedDailyReward";
import { yearly } from "./yearly";
import { messageDelete } from "./messageDelete";
import { messageDeleteBulk } from "./messageDeleteBulk";
import { messageReactionAdd } from "./messageReactionAdd";
import { messageReactionRemove } from "./messageReactionRemove";
import { userBackFromLongVoiceBreak } from "./userBackFromLongVoiceBreak";
import { userSignificantVoiceActivityStreak } from "./userSignificantVoiceActivityStreak";
import { guildVoiceEmpty } from "./guildVoiceEmpty";
import { minute } from "./minute";
import { channelDelete } from "./channelDelete";
import { roleUpdate } from "./roleUpdate";
import { guildMemberRemove } from "./guildMemberRemove";

const events: Event[] = [
    ready,
    guildCreate,
    interactionCreate,
    userUpdate,
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
    userReceivedDailyReward,
    yearly,
    messageDelete,
    messageDeleteBulk,
    userBackFromLongVoiceBreak,
    userSignificantVoiceActivityStreak,
    messageReactionAdd,
    messageReactionRemove,
    quarter,
    guildVoiceEmpty,
    minute,
    channelDelete,
    roleUpdate
];

export default events;