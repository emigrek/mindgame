import { ActivityType, Collection, GuildMember, Presence, VoiceBasedChannel } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import voiceActivitySchema from "../schemas/VoiceActivity";
import presenceActivitySchema from "../schemas/PresenceActivity";

import mongoose from "mongoose";
import moment from "moment";
import { updateUserStatistics } from "../user";
import { Guild, User, UserGuildActivityDetails } from "../../interfaces";

const voiceActivityModel = mongoose.model("VoiceActivity", voiceActivitySchema);
const presenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

const startVoiceActivity = async (client: ExtendedClient, member: GuildMember, channel: VoiceBasedChannel) => {
    if(
        member.user.bot ||
        channel.equals(member.guild.afkChannel!)
    ) return;

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

const getUserGuildsActivityDetails = async (sourceUser: User) => {
    const allDetails: Collection<string, UserGuildActivityDetails> = new Collection();

    const voiceActivites = await voiceActivityModel.find({
        userId: sourceUser.userId
    });

    for(const voiceActivity of voiceActivites) {
        let duration = moment(voiceActivity.to).diff(moment(voiceActivity.from), "seconds");
        if(!voiceActivity.to) duration = moment().diff(moment(voiceActivity.from), "seconds");

        if(allDetails.has(voiceActivity.guildId)) {
            allDetails.get(voiceActivity.guildId)!.time.voice += duration;
        } else {
            allDetails.set(voiceActivity.guildId, {
                guildId: voiceActivity.guildId,
                userId: voiceActivity.userId,
                time: {
                    voice: duration
                }
            });
        }
    }

    return allDetails;
}

const getFavoriteGuildDetails = async (sourceUser: User) => {
    const details = await getUserGuildsActivityDetails(sourceUser);
    if(!details.size) return null;
    const sorted = details.sort((a, b) => b.time.voice - a.time.voice);
    return sorted.first();
};

const getVoiceActivity = async (member: GuildMember) => {
    const exists = await voiceActivityModel.findOne({ userId: member.id, guildId: member.guild.id, to: null });
    return exists;
};

const getPresenceActivity = async (member: GuildMember) => {
    const exists = await presenceActivityModel.findOne({ userId: member.id, guildId: member.guild.id, to: null });
    return exists;
}

export { startVoiceActivity, startPresenceActivity, getFavoriteGuildDetails, endVoiceActivity, endPresenceActivity, getVoiceActivity, getPresenceActivity, getUserGuildsActivityDetails, voiceActivityModel };