import { GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import voiceActivitySchema from "../schemas/VoiceActivity";
import presenceActivitySchema from "../schemas/PresenceActivity";

import mongoose from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "../user";

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);
const presenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

const startVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel) => {
    if(member.user.bot) return;

    const exists = await getVoiceActivity(member);
    if(exists) return;

    const newVoiceActivity = new voiceActivityModel({
        userId: member.id,
        channelId: channel.id,
        voiceStateId: member.voice?.id,
        guildId: member.guild.id,
        streaming: member.voice?.streaming,
        from: moment().toDate()
    });

    await newVoiceActivity.save();
    return newVoiceActivity;
}

const startPresenceActivity = async (client: ExtendedClient, member: GuildMember, presence: Presence) => {
    if(member.user.bot) return;
    
    const exists = await getPresenceActivity(member);
    if(exists) return;

    const newPresenceActivity = new presenceActivityModel({
        userId: member.id,
        guildId: member.guild.id,
        from: moment().toDate(),
        status: presence.status,
        clientStatus: presence.clientStatus
    });

    await newPresenceActivity.save();
    return newPresenceActivity;
};

const endPresenceActivity = async (client: ExtendedClient, member: GuildMember) => {
    const exists = await getPresenceActivity(member);
    if(!exists) return;

    exists.to = moment().toDate();
    await exists.save();

    const duration = moment(exists.to).diff(moment(exists.from), "seconds");
    const expGained = Math.round(
        duration * 0.0063817
    );

    await updateUserStatistics(client, member.user, {
        exp: expGained,
        time: {
            presence: duration
        }
    });

    return exists;
}

const endVoiceActivity = async (client: ExtendedClient, member: GuildMember) => {
    const exists = await getVoiceActivity(member);
    if(!exists) return;

    exists.to = moment().toDate();
    await exists.save();

    const duration = moment(exists.to).diff(moment(exists.from), "seconds");
    const expGained = Math.round(
        duration * 0.16
    );


    await updateUserStatistics(client, member.user, {
        exp: expGained,
        time: {
            voice: duration
        }
    });

    return exists;
}

const getVoiceActivity = async (member: GuildMember) => {
    const exists = await voiceActivityModel.findOne({ userId: member.id, guildId: member.guild.id, to: null });
    return exists;
};

const getPresenceActivity = async (member: GuildMember) => {
    const exists = await presenceActivityModel.findOne({ userId: member.id, guildId: member.guild.id, to: null });
    return exists;
}

export { startVoiceActivity, startPresenceActivity, endVoiceActivity, endPresenceActivity, getVoiceActivity, getPresenceActivity, voiceActivityModel };