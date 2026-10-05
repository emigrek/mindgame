import ExtendedClient from "@/client/ExtendedClient";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { Collection, GuildMember, VoiceBasedChannel } from "discord.js";
import { AchievementManager } from "../structures/AchievementManager";
import { Marathon } from "./marathon";
import { NightOwl } from "./nightOwl";
import { Social } from "./social";
import { Suss } from "./suss";

// These depend on who else is in the channel, so everyone in the affected channels is re-checked
export const checkVoiceChannelMembers = (client: ExtendedClient, member: GuildMember, ...channels: (VoiceBasedChannel | null)[]) => {
    const members = new Collection<string, GuildMember>().set(member.id, member);
    for (const channel of channels)
        channel?.members.forEach(m => members.set(m.id, m));

    members
        .filter(m => !m.user.bot)
        .forEach(m => new AchievementManager({ client, userId: m.id, guildId: m.guild.id })
            .check([new Suss({ member: m }), new Social({ member: m })]));
};

export const checkVoiceSessionEnd = (client: ExtendedClient, member: GuildMember, activity: VoiceActivityDocument | null) => {
    if (!activity?.to)
        return;

    new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
        .check([new NightOwl({ activity }), new Marathon({ activity })]);
};
