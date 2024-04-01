import i18n from "@/client/i18n";
import {ActivityStreak, ProfilePages} from "@/interfaces";
import {BaseProfilePage} from "@/interfaces/BaseProfilePage";
import {ProfilePagePayloadParams} from "@/interfaces/ProfilePage";
import {getUserVoiceActivityStreak} from "@/modules/activity";
import {formatNextStreakField, formatStreakField} from "@/modules/messages";
import {BaseProfileEmbed} from "@/modules/messages/embeds";

export class GuildVoiceActivityStreak extends BaseProfilePage {
    voiceActivityStreak: ActivityStreak | undefined = undefined;

    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "🔥",
            name: i18n.__("profile.pages.guildVoiceActivityStreak"),
            description: params.guild?.name || "🤔",
            type: ProfilePages.GuildVoiceActivityStreak,
            params,
        });
    }

    async init() {
        const { guild, renderedUser } = this.params;
        if (!guild) return;
        this.voiceActivityStreak = await getUserVoiceActivityStreak(renderedUser.userId, guild.id);
    }

    async getPayload() {
        const { guild } = this.params;
        
        if (!guild) 
            throw new Error("Guild is required for guild voice activity streak page");
    
        return {
            embeds: [ await this.getGuildVoiceActivityStreakEmbed() ]
        };
    }

    async getGuildVoiceActivityStreakEmbed() {
        if (!this.voiceActivityStreak) 
            throw new Error("Voice activity streak is not initialized");

        const { renderedUser, colors, guild } = this.params;

        if (!guild)
            throw new Error("Guild is required for guild voice activity streak page");

        return BaseProfileEmbed({ user: renderedUser, colors })
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() || undefined,
            })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("notifications.voiceStreakField"),
                    value: formatStreakField(this.voiceActivityStreak.streak),
                    inline: true
                },
                {
                    name: i18n.__("notifications.nextVoiceStreakRewardField"),
                    value: formatNextStreakField(this.voiceActivityStreak.nextSignificant - (this.voiceActivityStreak.streak?.value || 0)),
                    inline: true,
                },
                {
                    name: i18n.__("notifications.maxVoiceStreakField"),
                    value: formatStreakField(this.voiceActivityStreak.maxStreak),
                    inline: true,
                }
            ]);
    }

    get embedTitleField() {
        return {
            name: `**${this.emoji}   ${this.name}**`,
            value: `** **`,
            inline: false,
        }
    }

    get visible() {
        if (this.voiceActivityStreak === undefined || this.voiceActivityStreak.streak === undefined) return false;
        const { streak } = this.voiceActivityStreak;
        return streak.value > 1;
    }
}