import i18n from "@/client/i18n";
import { ProfilePages, VoiceActivityStreak } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { getUserVoiceActivityStreak } from "@/modules/activity";
import { ProfileGuildVoiceActivityStreakEmbed } from "@/modules/messages/embeds";

export class GuildVoiceActivityStreak extends BaseProfilePage {
    voiceActivityStreak: VoiceActivityStreak | undefined = undefined;

    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🔥",
            name: i18n.__mf("profile.pages.guildVoiceActivityStreak", {
                guild: params.guild?.name,
            }),
            type: ProfilePages.GuildVoiceActivityStreak,
            position: 4,
            params: params,
        });

        this.init();
    }

    async init() {
        const { guild, renderedUser } = this.params;
        if (!guild) return;
        this.voiceActivityStreak = await getUserVoiceActivityStreak(renderedUser.userId, guild.id);
    }

    async getPayload() {
        const { renderedUser, guild, colors } = this.params;
        if (!guild) {
            throw new Error("Guild is required for guild voice activity streak page");
        }
        const guildVoiceActivityStreakEmbed = await ProfileGuildVoiceActivityStreakEmbed({
            user: renderedUser,
            guild,
            colors,
        });
        return {embeds: [guildVoiceActivityStreakEmbed]};
    }

    get visible() {
        if (this.voiceActivityStreak === undefined) return false;

        return this.voiceActivityStreak.streak !== undefined;
    }
}