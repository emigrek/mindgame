import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { config } from "@/config";
import { AchievementType, ActivityStreak } from "@/interfaces";
import type { BaseAchievement } from "@/modules/achievement";
import { getGuildsCount } from "@/modules/guild";
import { getGuildTresholdRole, getLevelRoleThreshold } from "@/modules/roles";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";
import { getUser, getUsersCount } from "@/modules/user";
import { getUserGuildStatistics } from '@/modules/user-guild-statistics';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, GuildMember, MessageFlags, User, codeBlock, quote } from "discord.js";
import moment from "moment";
import { InformationEmbed } from "@/modules/messages/embeds";

import Colors from "@/utils/colors";
import { formatTimeTotal } from "@/utils/date";
import { useImageHex, getColorInt } from "@/modules/messages/colors";
import { formatStreakField, formatNextStreakField } from "@/modules/messages/formatters";

const getLevelUpMessagePayload = async (client: ExtendedClient, user: User, guild: Guild, level: number) => {
    i18n.setLocale(guild.preferredLocale);

    const sourceUser = await getUser(user);
    // Notifications are public: never post an error embed, the event wrapper logs this instead
    if (!sourceUser)
        throw new Error(`No user document for ${user.id}, notifications are not built for bots`);

    const userGuildStatistics = await getUserGuildStatistics({ userId: sourceUser.userId, guildId: guild.id });
    const colors = await useImageHex(sourceUser.avatarUrl);
    const guildTresholdRole = await getGuildTresholdRole({
        client,
        guildId: guild.id,
        threshold: getLevelRoleThreshold(level)
    });

    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(i18n.__("notifications.levelUpTitle"))
        .setDescription(guildTresholdRole
            ? i18n.__mf("notifications.levelUpDescription", { userId: sourceUser.userId, roleId: guildTresholdRole.id })
            : i18n.__mf("notifications.levelUpDescriptionNoRole", { userId: sourceUser.userId, level }))
        .setFields(
            {
                name: i18n.__("notifications.levelField"),
                value: codeBlock(level.toString()),
                inline: true
            },
            {
                name: i18n.__("notifications.todayVoiceTimeField"),
                value: codeBlock(formatTimeTotal(userGuildStatistics.day.time.voice)),
                inline: true
            },
            {
                name: i18n.__("notifications.weekVoiceTimeField"),
                value: codeBlock(formatTimeTotal(userGuildStatistics.week.time.voice)),
                inline: true
            }
        )
        .setThumbnail("https://em-content.zobj.net/source/microsoft/209/sparkles_2728.png");

    return {
        embeds: [embed],
        flags: MessageFlags.SuppressNotifications as const
    };
};

const getAchievementLeveledUpMessagePayload = async (user: User, guild: Guild, achievement: BaseAchievement<AchievementType>, change: number) => {
    i18n.setLocale(guild.preferredLocale);

    const { achievementType, level, maxLevel } = achievement;
    const unlocked = level === change;
    const name = i18n.__(`achievements.${achievementType}.name`);
    const status = achievement.formatStatus();
    // A "Label: `value`" status becomes a "Label" field with the value in a code block, like the level
    const statusParts = status.match(/^([^:`]+): `([^`]+)`$/);
    const avatarUrl = user.displayAvatarURL({ extension: "png" });
    const colors = await useImageHex(avatarUrl);

    const embed = InformationEmbed()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(i18n.__(unlocked ? "notifications.achievementTitle" : "notifications.achievementUpgradedTitle"))
        .setDescription(
            i18n.__mf(unlocked ? "notifications.achievementDescription" : "notifications.achievementUpgradedDescription", { userId: user.id, achievement: name })
            + "\n" + quote(i18n.__(`achievements.${achievementType}.description`))
        )
        .setThumbnail(achievement.emojiImage || avatarUrl)
        .setFields([
            // Single level achievements are only unlocked, level adds nothing there
            ...(maxLevel > 1 ? [{
                name: i18n.__("notifications.levelField"),
                value: codeBlock(`${level}/${maxLevel}`),
                inline: true
            }] : []),
            ...(status ? [{
                name: statusParts ? statusParts[1] : i18n.__("notifications.achievementResultField"),
                value: statusParts ? codeBlock(statusParts[2]) : status,
                inline: true
            }] : [])
        ]);

    return {
        embeds: [embed],
        flags: MessageFlags.SuppressNotifications as const
    };
};

const getDailyRewardMessagePayload = async (client: ExtendedClient, user: User, guild: Guild, streak: ActivityStreak) => {
    i18n.setLocale(guild.preferredLocale);

    const sourceUser = await getUser(user);
    // Notifications are public: never post an error embed, the event wrapper logs this instead
    if (!sourceUser)
        throw new Error(`No user document for ${user.id}, notifications are not built for bots`);

    const colors = await useImageHex(sourceUser.avatarUrl);

    const embed = InformationEmbed()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(i18n.__("notifications.dailyRewardTitle"))
        .setDescription(i18n.__mf("notifications.dailyRewardDescription", { userId: sourceUser.userId }))
        .setThumbnail("https://em-content.zobj.net/source/microsoft/209/birthday-cake_1f382.png")
        .setFields([
            {
                name: i18n.__("notifications.dailyRewardField"),
                value: codeBlock(`${client.numberFormat.format(config.experience.voice.dailyActivityReward)} EXP`),
                inline: true
            }
        ]);

    if (streak.streak && streak.streak.value > 1) {
        embed.addFields([
            {
                name: i18n.__("notifications.voiceStreakField"),
                value: formatStreakField(streak.streak),
                inline: true
            }
        ]);
    }

    embed.addFields([
        {
            name: i18n.__("notifications.nextVoiceStreakRewardField"),
            value: formatNextStreakField(streak.nextSignificant - (streak.streak?.value || 0) || 3),
            inline: true
        }
    ]);

    return {
        embeds: [embed],
        flags: MessageFlags.SuppressNotifications as const
    };
};

const getFollowMessagePayload = async (client: ExtendedClient, member: GuildMember, lastActivity: VoiceActivityDocument) => {
    i18n.setLocale(member.guild.preferredLocale);

    const avatar = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const imageHex = await useImageHex(avatar);
    const color = getColorInt(imageHex.Vibrant);

    const activityEndMoment = lastActivity ? lastActivity.to ? moment(lastActivity.to) : moment() : moment()
    const unix = activityEndMoment.unix();
    const channelUrl = `https://discord.com/channels/${member.guild.id}/${member.voice.channelId}`;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: member.guild.name,
            iconURL: member.guild.iconURL({ extension: "png", size: 256 }) || undefined,
            url: channelUrl
        })
        .setTitle(member.user.username)
        .setDescription(i18n.__mf("follow.followNotificationDescription", { time: unix }))
        .setThumbnail(avatar);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(channelUrl)
                .setLabel(i18n.__("follow.join"))
        );

    return {
        embeds: [embed],
        components: [row]
    }
};

const getSignificantVoiceActivityStreakMessagePayload = async (client: ExtendedClient, member: GuildMember, streak: ActivityStreak) => {
    i18n.setLocale(member.guild.preferredLocale);

    const avatar = member.user.displayAvatarURL({ extension: "png", size: 256 });
    const imageHex = await useImageHex(avatar);
    const color = getColorInt(imageHex.Vibrant);
    
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(i18n.__("notifications.voiceStreakTitle"))
        .setDescription(i18n.__mf("notifications.voiceStreakDescription", {
            userId: member.id
        }))
        .setThumbnail("https://em-content.zobj.net/source/microsoft/209/fire_1f525.png")
        
    if (config.experience.voice.significantActivityStreakReward > 0) {
        embed.addFields([
            {
                name: i18n.__("notifications.voiceStreakRewardField"),
                value: codeBlock(`${client.numberFormat.format(config.experience.voice.significantActivityStreakReward)} EXP`),
                inline: true,
            }
        ]);
    }

    embed.addFields([{
        name: i18n.__("notifications.voiceStreakField"),
        value: formatStreakField(streak.streak),
        inline: true,
    }, {
        name: i18n.__("notifications.nextVoiceStreakRewardField"),
        value: formatNextStreakField(streak.nextSignificant - (streak.streak?.value || 0)),
        inline: true,
    }]);

    return {
        embeds: [embed],
        flags: MessageFlags.SuppressNotifications as const
    }
}

const getInviteNotificationMessagePayload = async (client: ExtendedClient, guild: Guild) => {
    i18n.setLocale(guild.preferredLocale);

    const embed = InformationEmbed()
        .setColor(Colors.Red)
        .setTitle(i18n.__("notifications.inviteTitle"))
        .setDescription(i18n.__mf("notifications.inviteDescription", {
            invite: client.getInvite(),
            repo: (await import("../../../../package.json")).repository.url,
        }))
        .setFields([
            {
                name: i18n.__("notifications.usersField"),
                value: codeBlock(client.numberFormat.format(await getUsersCount())),
                inline: true
            },
            {
                name: i18n.__("notifications.guildsField"),
                value: codeBlock(client.numberFormat.format(await getGuildsCount())),
                inline: true
            },
        ])
        .setThumbnail("https://em-content.zobj.net/source/microsoft/209/rocket_1f680.png");

    return {
        embeds: [embed],
        flags: MessageFlags.SuppressNotifications as const
    };
}

export { getLevelUpMessagePayload, getAchievementLeveledUpMessagePayload, getDailyRewardMessagePayload, getFollowMessagePayload, getSignificantVoiceActivityStreakMessagePayload, getInviteNotificationMessagePayload };
