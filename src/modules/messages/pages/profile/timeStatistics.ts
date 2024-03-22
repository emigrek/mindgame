import i18n from "@/client/i18n";
import { ProfilePages } from "@/interfaces";
import { BaseProfilePage } from "@/interfaces/BaseProfilePage";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { UserGuildStatistics } from "@/interfaces/UserGuildStatistics";
import { getColorInt } from "@/modules/messages";
import { getProfileTimePublicButton } from "@/modules/messages/buttons";
import { BaseProfileEmbed } from "@/modules/messages/embeds";
import { getUserGuildStatistics } from "@/modules/user-guild-statistics";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export class TimeStatistics extends BaseProfilePage {
    userGuildStatistics: UserGuildStatistics | undefined = undefined;

    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "⏳",
            name: i18n.__("profile.pages.timeStatistics"),
            type: ProfilePages.TimeStatistics,
            position: 2,
            params,
        });
    }

    async init() {
        const { renderedUser, guild } = this.params;
        if (!guild) {
            throw new Error("Guild is required for time statistics page");
        }

        this.userGuildStatistics = await getUserGuildStatistics({ userId: renderedUser.userId, guildId: guild.id });
    }

    async getPayload() {
        const { client, selfCall } = this.params;
        if (!this.userGuildStatistics) {
            throw new Error("User guild statistics is required for time statistics page");
        }

        if (!selfCall) {
            return {
                embeds: [await this.getTimeStatisticsEmbed()],
            };
        }

        const button = await getProfileTimePublicButton(client, this.userGuildStatistics);
        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);

        return {
            embeds: [await this.getTimeStatisticsEmbed()],
            components: [buttons],
        };
    }

    async getTimeStatisticsEmbed() {
        const { renderedUser, colors, selfCall } = this.params;
        if (!this.userGuildStatistics) {
            throw new Error("User guild statistics is required for time statistics page");
        }

        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("profile.voice"),
                    value: `\`\`\`${Math.round(this.userGuildStatistics.total.time.voice/3600)}H\`\`\``,
                    inline: true,
                },
                {
                    name: i18n.__("profile.overall"),
                    value: `\`\`\`${Math.round(this.userGuildStatistics.total.time.presence/3600)}H\`\`\``,
                    inline: true,
                },
            ]);

        if (selfCall && !this.userGuildStatistics.total.time.public) {
            embed.setColor(getColorInt(colors.DarkVibrant));
            embed.setFooter({
                text: i18n.__("profile.visibilityNotification")
            })
        }

        return embed;
    }

    get visible() {
        const { selfCall, guild } = this.params;
        return selfCall || this.userGuildStatistics?.total.time.public || !!guild;
    }
}