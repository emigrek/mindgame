import ExtendedClient from "@/client/ExtendedClient";
import { UserDocument } from "@/modules/schemas/User";
import Colors from "@/utils/colors";
import { EmbedBuilder } from "discord.js";
import { ImageHexColors, getColorInt } from "..";
import { getStatisticsTable, getTemporaryVoiceTimeStatisticsTable, getTimeStatisticsTable } from "@/modules/user";
import i18n from "@/client/i18n";

const ProfileEmbed = async (client: ExtendedClient, user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const statisticsTable = await getStatisticsTable(user);
    const timeStatisticsTable = await getTimeStatisticsTable(user);
    const temporaryVoiceTimeStatisticsTable = await getTemporaryVoiceTimeStatisticsTable(user);

    const statisticsSection = `**${i18n.__("profile.statistics")}**` + `\n` +
            `\`\`\`${statisticsTable}\`\`\`` + `\n`;

    const timeStatisticsSection = ((selfCall || user.stats.time.public) ? (
            `**${i18n.__("profile.timeStatistics")}** ` + ((selfCall && !user.stats.time.public) ? 
                `\n(*${i18n.__("profile.visibilityNotification")}*)` 
            : 
                ``
            ) 
            + `\n` + `\`\`\`${timeStatisticsTable}\`\`\`` + `\n`
        ) : 
            ``
        );

    const temporaryVoiceTimeStatisticsSection = `**${i18n.__("profile.temporaryVoiceTimeStatistics")}**` + `\n` +
            `\`\`\`${temporaryVoiceTimeStatisticsTable}\`\`\``;

    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(
            statisticsSection +
            timeStatisticsSection + 
            temporaryVoiceTimeStatisticsSection
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