import i18n from "@/client/i18n";
import {ProfilePages} from "@/interfaces";
import {BaseProfilePage} from "@/interfaces/BaseProfilePage";
import {ProfilePagePayloadParams} from "@/interfaces/ProfilePage";
import {ExtendedUserStatistics} from "@/interfaces/UserGuildStatistics";
import {getColorInt} from "@/modules/messages";
import {getProfileTimePublicButton} from "@/modules/messages/buttons";
import {BaseProfileEmbed} from "@/modules/messages/embeds";
import {getUserTotalStatistics} from "@/modules/user-guild-statistics";
import {ActionRowBuilder, ButtonBuilder, codeBlock} from "discord.js";

export class TimeStatistics extends BaseProfilePage {
    totalStatistics: ExtendedUserStatistics | undefined = undefined;

    constructor(params: ProfilePagePayloadParams) {
        super({
            emoji: "⏳",
            name: i18n.__("profile.pages.timeStatistics"),
            type: ProfilePages.TimeStatistics,
            params,
        });
    }

    async init() {
        const { renderedUser } = this.params;
        this.totalStatistics = await getUserTotalStatistics(renderedUser.userId);
    }

    async getPayload() {
        const { selfCall, renderedUser } = this.params;

        if (!selfCall) {
            return {
                embeds: [await this.getTimeStatisticsEmbed()],
            };
        }

        const button = await getProfileTimePublicButton({ isPublic: renderedUser.publicTimeStatistics });
        const buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button);

        return {
            embeds: [await this.getTimeStatisticsEmbed()],
            components: [buttons],
        };
    }

    async getTimeStatisticsEmbed() {
        const { renderedUser, colors, selfCall } = this.params;
        if (!this.totalStatistics) {
            throw new Error("User guild statistics is required for time statistics page");
        }

        const embed = BaseProfileEmbed({ user: renderedUser, colors })
            .setFields([
                this.embedTitleField,
                {
                    name: i18n.__("profile.voice"),
                    value: codeBlock(`${Math.round(this.totalStatistics.time.voice/3600)}H`),
                    inline: true,
                },
                {
                    name: i18n.__("profile.overall"),
                    value: codeBlock(`${Math.round(this.totalStatistics.time.presence/3600)}H`),
                    inline: true,
                },
            ]);

        if (selfCall && !renderedUser.publicTimeStatistics) {
            embed.setColor(getColorInt(colors.DarkVibrant));
            embed.setFooter({
                text: i18n.__("profile.visibilityNotification")
            })
        }

        return embed;
    }

    get visible() {
        const { selfCall, renderedUser } = this.params;
        return selfCall || renderedUser.publicTimeStatistics;
    }
}