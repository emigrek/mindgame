import ExtendedClient from "@/client/ExtendedClient";
import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { voiceActivityModel } from "@/modules/activity";
import { formatDuration } from "@/utils/date";
import { Collection, GuildMember, VoiceBasedChannel } from "discord.js";
import { AchievementManager } from "../structures/AchievementManager";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

const hour = 1000 * 60 * 60;

export class Suss extends GradualAchievement<AchievementType.SUSS> {
    emoji = "🤫";
    levels = [1, 5, 10, 25, 50, 100, 250, 500]
        .map((hours, index) => ({ value: hours * hour, level: index + 1 }));

    constructor(context?: BaseAchievementContext<AchievementType.SUSS>) {
        super({ context, achievementType: AchievementType.SUSS });
    }

    statusParams(payload: AchievementTypePayload[AchievementType.SUSS]) {
        return { ...payload, aloneMs: formatDuration(payload.aloneMs || 0) };
    }

    // Total time spent alone (no other active voice activity in the channel)
    async progress(context: AchievementTypeContext[AchievementType.SUSS]) {
        const { member } = context;
        const guildId = member.guild.id;

        const activity = await voiceActivityModel.findOne({ userId: member.id, guildId, to: null });
        const alone = !!activity && await voiceActivityModel.countDocuments({ guildId, channelId: activity.channelId, to: null }) === 1;
        const from = this.payload?.from;

        if (alone && !from) {
            await this.updatePayload({ from: new Date() });
        } else if (!alone && from) {
            await this.updatePayload({
                from: undefined,
                aloneMs: (this.payload?.aloneMs || 0) + Date.now() - from.getTime()
            });
        }

        return this.reach(this.payload?.aloneMs || 0);
    }
}

// Being alone depends on others, so everyone in the affected channels is re-checked
export const checkSuss = (client: ExtendedClient, member: GuildMember, ...channels: (VoiceBasedChannel | null)[]) => {
    const members = new Collection<string, GuildMember>().set(member.id, member);
    for (const channel of channels)
        channel?.members.forEach(m => members.set(m.id, m));

    members
        .filter(m => !m.user.bot)
        .forEach(m => new AchievementManager({ client, userId: m.id, guildId: m.guild.id }).check(new Suss({ member: m })));
};
