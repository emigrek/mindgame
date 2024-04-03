import ExtendedClient from "@/client/ExtendedClient";
import {ActivityStreak, Event} from "@/interfaces";
import {getGuild} from "@/modules/guild";
import {createMessage, getSignificantVoiceActivityStreakMessagePayload} from "@/modules/messages";
import {GuildMember, TextChannel} from "discord.js";
import NotificationsManager from "@/modules/messages/notificationsManager";

export const userSignificantVoiceActivityStreak: Event = {
    name: "userSignificantVoiceActivityStreak",
    run: async (client: ExtendedClient, member: GuildMember, streak: ActivityStreak) => {
        const guild = await getGuild(member.guild.id);
        if (!guild || !guild.notifications || !guild.channelId) return;

        const channel = await client.channels.fetch(guild.channelId) as TextChannel;
        if (!channel) return;

        const payload = await getSignificantVoiceActivityStreakMessagePayload(client, member, streak);

        await NotificationsManager.getInstance().schedule({
            channel: channel,
            payload: payload,
            callback: async message => {
                await message.react("😱");
                await createMessage(message, member.id, "significantVoiceActivityStreakMessage");
            }
        });
    }
}