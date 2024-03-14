import { GuildMember, TextChannel } from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { createMessage, getSignificantVoiceActivityStreakMessagePayload } from "@/modules/messages";
import { getGuild } from "@/modules/guild";

export const userSignificantVoiceActivityStreak: Event = {
    name: "userSignificantVoiceActivityStreak",
    run: async (client: ExtendedClient, member: GuildMember, streak: number) => {
        const guild = await getGuild(member.guild);
        if (!guild || !guild.notifications || !guild.channelId) return;

        const channel = await client.channels.fetch(guild.channelId) as TextChannel;
        if (!channel) return;

        const payload = await getSignificantVoiceActivityStreakMessagePayload(client, member, streak);

        await channel.send(payload)
            .then(async message => {
                await message.react("😱");
                await createMessage(message, member.id, "significantVoiceActivityStreakMessage");
            })
            .catch(error => console.log("Error while sending significant voice activity streak message: ", error));
    }
}