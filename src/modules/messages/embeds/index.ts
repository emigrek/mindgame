import ExtendedClient from "@/client/ExtendedClient";
import { UserDocument } from "@/modules/schemas/User";
import Colors from "@/utils/colors";
import { EmbedBuilder } from "discord.js";
import { ImageHexColors, getColorInt, getLocalizedDateRange } from "..";
import { getExperienceProcentage, getUserRank } from "@/modules/user";
import i18n from "@/client/i18n";
import { getFollowers } from "@/modules/follow";
import { formatLastActivityDetails, getUserLastActivityDetails } from "@/modules/activity";
import { ProfilePages } from "@/stores/profileStore";

const ProfileEmbeds = async (client: ExtendedClient, user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const rank = await getUserRank(user);
    const experienceProcentage = await getExperienceProcentage(user);
    const followers = await getFollowers(user.userId).then(followers => followers.length);
    const userLastActivityDetails = await getUserLastActivityDetails(client, user);

    const about = new EmbedBuilder()
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
        .setImage('https://i.imgur.com/TwVsmhg.png');

    const statisticsEmbed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .addFields([
            {
                name: `📊  **${i18n.__("profile.statistics")}**`,
                value: `** **`,
                inline: false,
            },
            {
                name: i18n.__("profile.rank"),
                value: `\`\`\`#${rank} ${rank === 1 ? '👑' : ''}\`\`\``,
                inline: true,
            },
            {
                name: i18n.__("profile.level"),
                value: `\`\`\`${user.stats.level} (${experienceProcentage}%)\`\`\``,
                inline: true,
            },
        ])
        .setImage('https://i.imgur.com/TwVsmhg.png');

    const timeStatisticsEmbed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
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
        .setImage('https://i.imgur.com/TwVsmhg.png');
    
    if (selfCall && !user.stats.time.public) {
        timeStatisticsEmbed.setFooter({
            text: i18n.__("profile.visibilityNotification")
        })
    }

    const temporaryPresenceTimeStatisticsEmbed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
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
        .setImage('https://i.imgur.com/TwVsmhg.png');

    if (selfCall) {
        temporaryPresenceTimeStatisticsEmbed.setFooter({
            text: i18n.__("profile.visibilityNotification")
        })
    }
    
    const temporaryVoiceTimeStatisticsEmbed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
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
        .setImage('https://i.imgur.com/TwVsmhg.png');

    const embeds = [
        {
            emoji: '📝',
            type: ProfilePages.About,
            embed: about,
        },
        {
            emoji: '📊',
            type: ProfilePages.Statistics,
            embed: statisticsEmbed,
        },
    ];
    if (selfCall || user.stats.time.public) {
        embeds.push({
            emoji: '⏳',
            type: ProfilePages.TimeSpent,
            embed: timeStatisticsEmbed,
        });
    }
    if (selfCall) {
        embeds.push({
            emoji: '📅',
            type: ProfilePages.PresenceActivity,
            embed: temporaryPresenceTimeStatisticsEmbed,
        });
    }
    embeds.push({
        emoji: '🔊',
        type: ProfilePages.VoiceActivity,
        embed: temporaryVoiceTimeStatisticsEmbed,
    });

    return embeds;
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

export { InformationEmbed, ErrorEmbed, WarningEmbed, ProfileEmbeds };