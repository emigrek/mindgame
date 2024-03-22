import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { getColorInt } from "@/modules/messages";
import { getProfileTimePublicButton } from "@/modules/messages/buttons";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export class TimeStatistics extends BaseProfilePage {
    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "⏳",
            name: i18n.__("profile.pages.timeStatistics"),
            type: ProfilePages.TimeStatistics,
            position: 2,
            params,
        });
    }

    async getPayload() {
        const { client, renderedUser, selfCall } = this.params;

        if (!selfCall) {
            return {
                embeds: [await this.getTimeStatisticsEmbed()],
            };
        }

        const button = await getProfileTimePublicButton(client, renderedUser);
        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);

        return {
            embeds: [await this.getTimeStatisticsEmbed()],
            components: [buttons],
        };
    }

    async getTimeStatisticsEmbed() {
        const { renderedUser, colors, selfCall } = this.params;

        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("profile.voice"),
                    value: `\`\`\`${Math.round(renderedUser.stats.time.voice/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("profile.overall"),
                    value: `\`\`\`${Math.round(renderedUser.stats.time.presence/3600)}H\`\`\``,
                    inline: true,
                },
            ]);

        if (selfCall && !renderedUser.stats.time.public) {
            embed.setColor(getColorInt(colors.DarkVibrant));
            embed.setFooter({
                text: i18n.__("profile.visibilityNotification")
            })
        }

        return embed;
    }

    get visible() {
        const { selfCall, renderedUser } = this.params;
        return selfCall || renderedUser.stats.time.public;
    }
}