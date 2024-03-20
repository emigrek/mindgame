import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { formatLastActivityDetails, getUserLastActivityDetails, getUserVoiceActivityStreak } from "@/modules/activity";
import { getFollowers } from "@/modules/follow";
import { KnownLinks } from "@/modules/messages/knownLinks";
import { UserDocument } from "@/modules/schemas/User";
import { getExperienceProcentage, getUserRank } from "@/modules/user";
import Colors from "@/utils/colors";
import { EmbedBuilder, Guild } from "discord.js";
import { ImageHexColors, getColorInt, getLocalizedDateRange } from "..";

const BaseProfileEmbed = (user: UserDocument, colors: ImageHexColors) => {
    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(`** **`)
        .setImage(KnownLinks.EMBED_SPACER);

    return embed;
};

const ProfileAboutEmbed = async (client: ExtendedClient, user: UserDocument, colors: ImageHexColors) => {
    const userLastActivityDetails = await getUserLastActivityDetails(client, user);
    const followers = await getFollowers(user.userId).then(followers => followers.length);
    const embed = BaseProfileEmbed(user, colors)
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
    const embed = BaseProfileEmbed(user, colors)
        .addFields([
            {
                name: `📊  **${i18n.__("profile.pages.statistics")}**`,
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
        ]);

    return embed;
};

const ProfileTimeStatisticsEmbed = async (user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const embed = BaseProfileEmbed(user, colors)
        .setFields([
            {
                name: `⏳  **${i18n.__("profile.pages.timeStatistics")}**`,
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
        ]);

    if (selfCall && !user.stats.time.public) {
        embed.setColor(getColorInt(colors.DarkVibrant));
        embed.setFooter({
            text: i18n.__("profile.visibilityNotification")
        })
    }

    return embed;
};

const ProfilePresenceActivityEmbed = async (user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const embed = BaseProfileEmbed(user, colors)
        .setFields([
            {
                name: `🖥  **${i18n.__("profile.pages.presenceActivity")}**`,
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
        ]);

    if (selfCall) {
        embed.setColor(getColorInt(colors.DarkVibrant));
        embed.setFooter({
            text: i18n.__("profile.visibilityNotification")
        })
    }

    return embed;
};

const ProfileVoiceActivityEmbed = async (user: UserDocument, colors: ImageHexColors) => {
    const embed = BaseProfileEmbed(user, colors)
        .setFields([
            {
                name: `🔊  **${i18n.__("profile.pages.voiceActivity")}**`,
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
        ]);

    return embed;
};

const ProfileGuildVoiceActivityStreakEmbed = async (user: UserDocument, guild: Guild, colors: ImageHexColors) => {
    const streak = await getUserVoiceActivityStreak(user.userId, guild.id);

    const embed = BaseProfileEmbed(user, colors)
        .setFields([
            {
                name: `🔥  **${i18n.__mf("profile.pages.guildVoiceActivityStreak", { guild: guild.name })}**`,
                value: `** **`,
                inline: false,
            },
            {
                name: i18n.__("notifications.voiceStreakField"),
                value: `\`\`\`${i18n.__n("notifications.voiceStreakFormat", streak.streak)}\`\`\``,
                inline: true
            },
            {
                name: i18n.__("notifications.nextVoiceStreakRewardField"),
                value: `\`\`\`${i18n.__n("notifications.voiceStreakFormat", streak.nextSignificant - streak.streak)}\`\`\``,
                inline: true,
            },
        ]);

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

export { ErrorEmbed, InformationEmbed, ProfileAboutEmbed, ProfileGuildVoiceActivityStreakEmbed, ProfilePresenceActivityEmbed, ProfileStatisticsEmbed, ProfileTimeStatisticsEmbed, ProfileVoiceActivityEmbed, WarningEmbed };

