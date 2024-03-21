import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { getExperienceProcentage, getUserRank } from "@/modules/user";

export class Statistics extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "📊",
            name: i18n.__("profile.pages.statistics"),
            type: ProfilePages.Statistics,
            position: 1,
            params,
        })
    }

    async getPayload() {
        return {
            embeds: [await this.getStatisticsEmbed()],
        };
    }

    async getStatisticsEmbed() {
        const { renderedUser, colors } = this.params;
        const { rank, total } = await getUserRank(renderedUser);
        const experienceProcentage = await getExperienceProcentage(renderedUser);
        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .addFields([
                this.embedTitleField,
                {
                    name: i18n.__("profile.rank"),
                    value: `\`\`\`#${rank} ${rank === 1 ? '👑 ' : ''}/ ${total}\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("profile.level"),
                    value: `\`\`\`${renderedUser.stats.level} (${experienceProcentage}%)\`\`\``,
                    inline: true,
                },
            ]);

        return embed;
    }
}