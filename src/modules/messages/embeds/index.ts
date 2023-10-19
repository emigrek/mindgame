import ExtendedClient from "@/client/ExtendedClient";
import { UserDocument } from "@/modules/schemas/User";
import Colors from "@/utils/colors";
import { EmbedBuilder } from "discord.js";
import { ImageHexColors, getColorInt } from "..";
import { getStatisticsTable, getTimeStatisticsTable } from "@/modules/user";
import i18n from "@/client/i18n";

const ProfileEmbed = async (client: ExtendedClient, user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const statisticsTable = await getStatisticsTable(user);
    const timeStatisticsTable = await getTimeStatisticsTable(user);

    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(
            `**${i18n.__("profile.statistics")}**` + `\n` +
            `\`\`\`${statisticsTable}\`\`\`` + `\n` +
            ((selfCall || user.stats.time.public) ? (
            `**${i18n.__("profile.timeStatistics")}** ` + ((selfCall && !user.stats.time.public) ? `(${i18n.__("profile.visibilityNotification")})` : ``) + `\n` +
            `\`\`\`${timeStatisticsTable}\`\`\``) : ``)
        );

    return embed;
};

const InformationEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.EmbedGray);

    return embed;
};

const ErrorEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.Red);

    return embed;
};

const WarningEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.Yellow);

    return embed;
};

export { InformationEmbed, ErrorEmbed, WarningEmbed, ProfileEmbed };