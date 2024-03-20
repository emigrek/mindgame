import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ProfileGuildVoiceActivityStreakEmbed } from "@/modules/messages/embeds";

export class GuildVoiceActivityStreak extends BaseProfilePage {
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
    }

    async getPayload() {
        const { renderedUser, guild, colors } = this.params;
        if (!guild) {
            throw new Error("Guild is required for guild voice activity streak page");
        }
        const embed = await ProfileGuildVoiceActivityStreakEmbed(renderedUser, guild, colors);
        
        return {
            embeds: [embed],
        };
    }

    get visible() {
        return this.params.guild !== undefined;
    }
}