import { GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import voiceActivitySchema from "../schemas/VoiceActivity";
import mongoose from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "../user";

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);

const startVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel) => {
    const exists = await voiceActivityModel.findOne({ userId: member.id, guildId: member.guild.id, to: null });
    if(exists) return;

    const newVoiceActivity = new voiceActivityModel({
        userId: member.id,
        guildId: member.guild.id,
        channelId: channel.id,
        voiceStateId: member.voice?.id,
        streaming: member.voice?.streaming,
        from: new Date()
    });

    await newVoiceActivity.save();
    return newVoiceActivity;
}

const endVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel) => {
    const exists = await voiceActivityModel.findOne({ userId: member.id, guildId: member.guild.id, to: null });
    if(!exists) return;

    exists.to = new Date();
    await exists.save();

    const duration = moment(exists.to).diff(moment(exists.from), "seconds");
    const expGained = duration * 0.16;

    await updateUserStatistics(client, member.user, {
        exp: expGained,
        time: {
            voice: duration
        }
    });

    return exists;
}

const getVoiceActivity = async (member: GuildMember) => {
    const exists = await voiceActivityModel.findOne({ userId: member.id, to: null });
    return exists;
};

export { startVoiceActivity, endVoiceActivity, getVoiceActivity, voiceActivityModel };