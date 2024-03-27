import i18n from "@/client/i18n";
import {ProfilePages} from "@/interfaces";
import {BaseProfilePage} from "@/interfaces/BaseProfilePage";
import {ProfilePagePayloadParams} from "@/interfaces/ProfilePage";
import {BaseProfileEmbed} from "@/modules/messages/embeds";
import {getExperiencePercentage, getUserGuildRank, getUserGuildStatistics} from "@/modules/user-guild-statistics";

export class Statistics extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "📊",
            name: i18n.__("profile.pages.statistics"),
            description: params.guild?.name || "🤔",
            type: ProfilePages.Statistics,
            position: 2,
            params,
        })
    }

    async getPayload() {
        return {
            embeds: [await this.getStatisticsEmbed()],
        };
    }

    async getStatisticsEmbed() {
        const { renderedUser, colors, guild } = this.params;
        if (!guild) {
            throw new Error("Guild is required for statistics page");
        }
        
        const { rank, total } = await getUserGuildRank({ userId: renderedUser.userId, guildId: guild.id})
        const userGuildStatistics = await getUserGuildStatistics({ userId: renderedUser.userId, guildId: guild.id });
        const experiencePercentage = await getExperiencePercentage(userGuildStatistics);

        return BaseProfileEmbed({ user: renderedUser, colors })
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL() || undefined,
            })
            .addFields([
                this.embedTitleField,
                {
                    name: i18n.__("profile.rank"),
                    value: `\`\`\`#${rank} ${rank === 1 ? '👑 ' : ''}/ ${total}\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("profile.level"),
                    value: `\`\`\`${userGuildStatistics.level} (${experiencePercentage}%)\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("profile.messages"),
                    value: `\`\`\`${userGuildStatistics.total.messages}\`\`\``,
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
        const { guild } = this.params;
        return !!guild;
    }
} 