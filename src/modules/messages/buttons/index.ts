import ExtendedClient from "@/client/ExtendedClient";
import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonStyle, Message, UserResolvable } from "discord.js";
import { getMessage } from "@/modules/messages";
import { Groups, getRandomEmojiFromGroup } from "@/utils/emojis";
import { GuildDocument } from "@/modules/schemas/Guild";
import { UserDocument } from "@/modules/schemas/User";
import { getFollow } from "@/modules/follow";
import i18n from "@/client/i18n";

const getNotificationsButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const notificationsButton = new ButtonBuilder()
        .setCustomId("notifications")
        .setLabel(i18n.__("config.notificationsButtonLabel"))
        .setStyle(sourceGuild.notifications ? ButtonStyle.Success : ButtonStyle.Secondary);

    return notificationsButton;
}

const getStatisticsNotificationButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const statisticsNotificationButton = new ButtonBuilder()
        .setCustomId("statisticsNotification")
        .setLabel(i18n.__("config.statisticsNotificationButtonLabel"))
        .setStyle(sourceGuild.statisticsNotification ? ButtonStyle.Success : ButtonStyle.Secondary);

    return statisticsNotificationButton;
}

const getAutoSweepingButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const autoSweepingButton = new ButtonBuilder()
        .setCustomId("autoSweeping")
        .setLabel(i18n.__("config.autoSweepingButtonLabel"))
        .setStyle(sourceGuild.autoSweeping ? ButtonStyle.Success : ButtonStyle.Secondary);

    return autoSweepingButton;
}

const getLevelRolesButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const levelRolesButton = new ButtonBuilder()
        .setCustomId("levelRoles")
        .setLabel(i18n.__("config.levelRolesButtonLabel"))
        .setStyle(sourceGuild.levelRoles ? ButtonStyle.Success : ButtonStyle.Secondary);

    return levelRolesButton;
}

const getLevelRolesHoistButton = async (client: ExtendedClient, sourceGuild: GuildDocument) => {
    const levelRolesHoistButton = new ButtonBuilder()
        .setCustomId("levelRolesHoist")
        .setLabel(i18n.__("config.levelRolesHoistButtonLabel"))
        .setStyle(sourceGuild.levelRolesHoist ? ButtonStyle.Success : ButtonStyle.Secondary);

    return levelRolesHoistButton;
}

const getProfileTimePublicButton = async (client: ExtendedClient, sourceUser: UserDocument) => {
    const publicProfileButton = new ButtonBuilder()
        .setCustomId("profileTimePublic")
        .setLabel(i18n.__("profile.timePublicButtonLabel"))
        .setStyle(sourceUser.stats.time.public ? ButtonStyle.Success : ButtonStyle.Secondary);

    return publicProfileButton;
}

const getProfileFollowButton = async (client: ExtendedClient, sourceUser: UserDocument, targetUser: UserDocument) => {
    const following = await getFollow(sourceUser.userId, targetUser.userId);

    const followButton = new ButtonBuilder()
        .setCustomId("profileFollow")
        .setLabel(following ? i18n.__("profile.unfollowButtonLabel") : i18n.__("profile.followButtonLabel"))
        .setStyle(following ? ButtonStyle.Danger : ButtonStyle.Primary);

    return followButton;
}

const getRoleColorSwitchButton = async (client: ExtendedClient, current: boolean) => {
    const roleColorSwitchButton = new ButtonBuilder()
        .setCustomId("roleColorSwitch")
        .setLabel(!current ? i18n.__("color.roleColorOnButtonLabel") : i18n.__("color.roleColorOffButtonLabel"))
        .setStyle(current ? ButtonStyle.Success : ButtonStyle.Secondary);

    return roleColorSwitchButton;
}

const getRoleColorUpdateButton = async () => {
    const roleColorUpdateButton = new ButtonBuilder()
        .setCustomId("roleColorUpdate")
        .setLabel(i18n.__("color.roleColorUpdateButtonLabel"))
        .setStyle(ButtonStyle.Primary);

    return roleColorUpdateButton;
}

const getProfileButton = async (client: ExtendedClient, targetUserId?: UserResolvable) => {
    let profileButton;

    if (targetUserId) {
        const targetUser = await client.users.fetch(targetUserId);

        profileButton = new ButtonBuilder()
            .setCustomId("profile")
            .setLabel(i18n.__mf("quickButton.profileTargetLabel", { username: targetUser.username }))
            .setStyle(ButtonStyle.Primary);

        return profileButton;
    }

    profileButton = new ButtonBuilder()
        .setCustomId("profile")
        .setLabel(i18n.__("quickButton.profileLabel"))
        .setStyle(ButtonStyle.Primary);

    return profileButton;
}

const getGuildStatisticsButton = async () => {
    const statisticsButton = new ButtonBuilder()
        .setCustomId("guildStatistics")
        .setLabel(i18n.__("quickButton.guildStatisticsLabel"))
        .setStyle(ButtonStyle.Secondary);

    return statisticsButton;
}

const getSweepButton = async () => {
    const sweepButton = new ButtonBuilder()
        .setCustomId("sweep")
        .setLabel(i18n.__("quickButton.sweepLabel"))
        .setStyle(ButtonStyle.Secondary);

    return sweepButton;
};

const getRankingButton = async () => {
    const rankingButton = new ButtonBuilder()
        .setCustomId("ranking")
        .setLabel(i18n.__("quickButton.rankingLabel"))
        .setStyle(ButtonStyle.Primary);

    return rankingButton;
};

const getRankingPageUpButton = async (disabled = false) => {
    const rankingPageUpButton = new ButtonBuilder()
        .setCustomId("rankingPageUp")
        .setDisabled(disabled)
        .setLabel(i18n.__("ranking.pageUpButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return rankingPageUpButton;
};

const getRankingPageDownButton = async (disabled = false) => {
    const rankingPageDownButton = new ButtonBuilder()
        .setCustomId("rankingPageDown")
        .setDisabled(disabled)
        .setLabel(i18n.__("ranking.pageDownButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return rankingPageDownButton;
};

const getRankingGuildOnlyButton = async (newStatus: boolean) => {
    const rankingGuildOnlyButton = new ButtonBuilder()
        .setCustomId("rankingGuildOnly")
        .setLabel(newStatus ? i18n.__("ranking.guildOnlyButtonLabel") : i18n.__("ranking.allGuildsButtonLabel"))
        .setStyle(newStatus ? ButtonStyle.Success : ButtonStyle.Secondary);

    return rankingGuildOnlyButton;
}

const getRankingSettingsButton = async () => {
    const rankingSettingsButton = new ButtonBuilder()
        .setCustomId("rankingSettings")
        .setLabel(i18n.__("ranking.settingsButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return rankingSettingsButton;
};

const getCommitsButton = async () => {
    const commitsButton = new ButtonBuilder()
        .setCustomId("commits")
        .setLabel(i18n.__("quickButton.commitsLabel"))
        .setStyle(ButtonStyle.Secondary);

    return commitsButton;
};

const getHelpButton = async () => {
    const helpButton = new ButtonBuilder()
        .setCustomId("help")
        .setLabel(`${i18n.__("quickButton.helpLabel")} ${getRandomEmojiFromGroup(Groups.AnimalsAndNature).char}`)
        .setStyle(ButtonStyle.Success);

    return helpButton;
};

const getRepoButton = async () => {
    const repoUrl = (await import("../../../../package.json")).repository.url;
    const repoButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(repoUrl)
        .setLabel(i18n.__("help.repoButtonLabel"));

    return repoButton;
}

const getQuickButtonsRows = async (client: ExtendedClient, message: Message) => {
    const sourceMessage = await getMessage(message.id);

    const row = new ActionRowBuilder<ButtonBuilder>();
    const row2 = new ActionRowBuilder<ButtonBuilder>();

    const profileButton = await getProfileButton(client, sourceMessage?.targetUserId || undefined);
    const guildStatisticsButton = await getGuildStatisticsButton();
    const sweepButton = await getSweepButton();
    const rankingButton = await getRankingButton();
    const commitsButton = await getCommitsButton();
    const helpButton = await getHelpButton();

    row.setComponents(sweepButton, profileButton, rankingButton);
    row2.setComponents(guildStatisticsButton, commitsButton, helpButton);

    return [row, row2];
}

export { getRepoButton, getRankingGuildOnlyButton, getRankingSettingsButton, getHelpButton, getRankingPageUpButton, getRankingPageDownButton, getAutoSweepingButton, getRoleColorUpdateButton, getRoleColorSwitchButton, getQuickButtonsRows, getNotificationsButton, getStatisticsNotificationButton, getLevelRolesButton, getLevelRolesHoistButton, getProfileTimePublicButton, getProfileFollowButton };