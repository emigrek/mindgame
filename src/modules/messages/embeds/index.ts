import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { formatLastActivityDetails, getUserLastActivityDetails } from "@/modules/activity";
import { getFollowers } from "@/modules/follow";
import { KnownLinks } from "@/modules/messages/knownLinks";
import { UserDocument } from "@/modules/schemas/User";
import { getExperienceProcentage, getUserRank } from "@/modules/user";
import Colors from "@/utils/colors";
import { EmbedBuilder } from "discord.js";
import { ImageHexColors, getColorInt, getLocalizedDateRange } from "..";

const ProfileAboutEmbed = async (client: ExtendedClient, user: UserDocument, colors: ImageHexColors) => {
    const userLastActivityDetails = await getUserLastActivityDetails(client, user);
    const followers = await getFollowers(user.userId).then(followers => followers.length);
    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(formatLastActivityDetails(userLastActivityDetails))
        .setFields([
            {
                name: i18n.__("profile.followers"),
                value: `\`\`\`${followers}\`\`\``,
                inline: true,
            },
        ])
        .setImage(KnownLinks.EMBED_SPACER);

    return embed;
};

const ProfileStatisticsEmbed = async (user: UserDocument, colors: ImageHexColors) => {
    const { rank, total } = await getUserRank(user);
    const experienceProcentage = await getExperienceProcentage(user);
    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setDescription(`** **`)
        .setThumbnail(user.avatarUrl)
        .addFields([
            {
                name: `📊  **${i18n.__("profile.statistics")}**`,
                value: `** **`,
                inline: false,
            },
            {
                name: i18n.__("profile.rank"),
                value: `\`\`\`#${rank} ${rank === 1 ? '👑 ' : ''}/ ${total}\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("profile.level"),
                value: `\`\`\`${user.stats.level} (${experienceProcentage}%)\`\`\``,
                inline: true,
            },
        ])
        .setImage(KnownLinks.EMBED_SPACER);

    return embed;
};

const ProfileTimeStatisticsEmbed = async (user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(`** **`)
        .setFields([
            {
                name: `⏳  **${i18n.__("profile.timeStatistics")}**`,
                value: `** **`,
                inline: false,
            },
            {
                name: i18n.__("profile.voice"),
                value: `\`\`\`${Math.round(user.stats.time.voice/3600)}H\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("profile.overall"),
                value: `\`\`\`${Math.round(user.stats.time.presence/3600)}H\`\`\``,
                inline: true,
            },
        ])
        .setImage(KnownLinks.EMBED_SPACER)

    if (selfCall && !user.stats.time.public) {
        embed.setColor(getColorInt(colors.DarkVibrant));
        embed.setFooter({
            text: i18n.__("profile.visibilityNotification")
        })
    }

    return embed;
};

const ProfileTempPresenceTimeStatisticsEmbed = async (user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(`** **`)
        .setFields([
            {
                name: `📅  **${i18n.__("profile.temporaryPresenceTimeStatistics")}**`,
                value: `** **`,
                inline: false,
            },
            {
                name: i18n.__("notifications.todayVoiceTimeField"),
                value: `${getLocalizedDateRange('day')}\n\`\`\`${Math.round(user.day.time.presence/3600)}H\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("notifications.weekVoiceTimeField"),
                value: `${getLocalizedDateRange('week')}\n\`\`\`${Math.round(user.week.time.presence/3600)}H\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("notifications.monthVoiceTimeField"),
                value: `${getLocalizedDateRange('month')}\n\`\`\`${Math.round(user.month.time.presence/3600)}H\`\`\``,
                inline: true,
            },
        ])
        .setImage(KnownLinks.EMBED_SPACER);

    if (selfCall) {
        embed.setColor(getColorInt(colors.DarkVibrant));
        embed.setFooter({
            text: i18n.__("profile.visibilityNotification")
        })
    }

    return embed;
};

const ProfileTempVoiceTimeStatisticsEmbed = async (client: ExtendedClient, user: UserDocument, colors: ImageHexColors) => {
    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(`** **`)
        .setFields([
            {
                name: `🔊  **${i18n.__("profile.temporaryVoiceTimeStatistics")}**`,
                value: `** **`,
                inline: false,
            },
            {
                name: i18n.__("notifications.todayVoiceTimeField"),
                value: `${getLocalizedDateRange('day')}\n\`\`\`${Math.round(user.day.time.voice/3600)}H\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("notifications.weekVoiceTimeField"),
                value: `${getLocalizedDateRange('week')}\n\`\`\`${Math.round(user.week.time.voice/3600)}H\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("notifications.monthVoiceTimeField"),
                value: `${getLocalizedDateRange('month')}\n\`\`\`${Math.round(user.month.time.voice/3600)}H\`\`\``,
                inline: true,
            },
        ])
        .setImage(KnownLinks.EMBED_SPACER);

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

export { ErrorEmbed, InformationEmbed, ProfileAboutEmbed, ProfileStatisticsEmbed, ProfileTempPresenceTimeStatisticsEmbed, ProfileTempVoiceTimeStatisticsEmbed, ProfileTimeStatisticsEmbed, WarningEmbed };

