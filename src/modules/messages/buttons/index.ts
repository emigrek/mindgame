import ExtendedClient from "../../../client/ExtendedClient";
import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonStyle, Message, UserResolvable } from "discord.js";
import { Guild as DatabaseGuild, User } from "../../../interfaces";
import { getMessage } from "..";
import { getRandomAnimalEmoji } from "../../../utils/emojis";

const getExitButton = async (client: ExtendedClient) => {
    const exitButton = new ButtonBuilder()
        .setCustomId("remove")
        .setLabel(client.i18n.__("config.close"))
        .setStyle(ButtonStyle.Danger);

    return exitButton;
}

const getNotificationsButton = async (client: ExtendedClient, sourceGuild: DatabaseGuild) => {
    const notificationsButton = new ButtonBuilder()
        .setCustomId("notifications")
        .setLabel(client.i18n.__("config.notificationsButtonLabel"))
        .setStyle(sourceGuild!.notifications ? ButtonStyle.Success : ButtonStyle.Secondary);

    return notificationsButton;
}

const getStatisticsNotificationButton = async (client: ExtendedClient, sourceGuild: DatabaseGuild) => {
    const statisticsNotificationButton = new ButtonBuilder()
        .setCustomId("statisticsNotification")
        .setLabel(client.i18n.__("config.statisticsNotificationButtonLabel"))
        .setStyle(sourceGuild!.statisticsNotification ? ButtonStyle.Success : ButtonStyle.Secondary);

    return statisticsNotificationButton;
}

const getAutoSweepingButton = async (client: ExtendedClient, sourceGuild: DatabaseGuild) => {
    const autoSweepingButton = new ButtonBuilder()
        .setCustomId("autoSweeping")
        .setLabel(client.i18n.__("config.autoSweepingButtonLabel"))
        .setStyle(sourceGuild!.autoSweeping ? ButtonStyle.Success : ButtonStyle.Secondary);

    return autoSweepingButton;
}

const getLevelRolesButton = async (client: ExtendedClient, sourceGuild: DatabaseGuild) => {
    const levelRolesButton = new ButtonBuilder()
        .setCustomId("levelRoles")
        .setLabel(client.i18n.__("config.levelRolesButtonLabel"))
        .setStyle(sourceGuild!.levelRoles ? ButtonStyle.Success : ButtonStyle.Secondary);

    return levelRolesButton;
}

const getLevelRolesHoistButton = async (client: ExtendedClient, sourceGuild: DatabaseGuild) => {
    const levelRolesHoistButton = new ButtonBuilder()
        .setCustomId("levelRolesHoist")
        .setLabel(client.i18n.__("config.levelRolesHoistButtonLabel"))
        .setStyle(sourceGuild!.levelRolesHoist ? ButtonStyle.Success : ButtonStyle.Secondary);

    return levelRolesHoistButton;
}

const getProfileTimePublicButton = async (client: ExtendedClient, sourceUser: User) => {
    const publicProfileButton = new ButtonBuilder()
        .setCustomId("profileTimePublic")
        .setLabel(client.i18n.__("profile.timePublicButtonLabel"))
        .setStyle(sourceUser!.stats.time.public ? ButtonStyle.Success : ButtonStyle.Secondary);

    return publicProfileButton;
}

const getRoleColorSwitchButton = async (client: ExtendedClient, current: boolean) => {
    const roleColorSwitchButton = new ButtonBuilder()
        .setCustomId("roleColorSwitch")
        .setLabel(!current ? client.i18n.__("color.roleColorOnButtonLabel") : client.i18n.__("color.roleColorOffButtonLabel"))
        .setStyle(current ? ButtonStyle.Success : ButtonStyle.Secondary);

    return roleColorSwitchButton;
}

const getRoleColorUpdateButton = async (client: ExtendedClient) => {
    const roleColorUpdateButton = new ButtonBuilder()
        .setCustomId("roleColorUpdate")
        .setLabel(client.i18n.__("color.roleColorUpdateButtonLabel"))
        .setStyle(ButtonStyle.Primary);

    return roleColorUpdateButton;
}

const getProfileButton = async (client: ExtendedClient, targetUserId?: UserResolvable) => {
    let profileButton;

    if(targetUserId) {
        const targetUser = await client.users.fetch(targetUserId);

        profileButton = new ButtonBuilder()
            .setCustomId("profile")
            .setLabel(client.i18n.__mf("quickButton.profileTargetLabel", { tag: targetUser.tag }))
            .setStyle(ButtonStyle.Primary);

        return profileButton;
    }

    profileButton = new ButtonBuilder()
        .setCustomId("profile")
        .setLabel(client.i18n.__("quickButton.profileLabel"))
        .setStyle(ButtonStyle.Primary);

    return profileButton;
}

const getGuildStatisticsButton = async (client: ExtendedClient) => {
    const statisticsButton = new ButtonBuilder()
        .setCustomId("guildStatistics")
        .setLabel(client.i18n.__("quickButton.guildStatisticsLabel"))
        .setStyle(ButtonStyle.Secondary);

    return statisticsButton;
}

const getSweepButton = async (client: ExtendedClient) => {
    const sweepButton = new ButtonBuilder()
        .setCustomId("sweep")
        .setLabel(client.i18n.__("quickButton.sweepLabel"))
        .setStyle(ButtonStyle.Secondary);
    
    return sweepButton;
};

const getRankingButton = async (client: ExtendedClient) => {
    const rankingButton = new ButtonBuilder()
        .setCustomId("ranking")
        .setLabel(client.i18n.__("quickButton.rankingLabel"))
        .setStyle(ButtonStyle.Primary);

    return rankingButton;
};

const getRankingPageUpButton = async (client: ExtendedClient, disabled: boolean = false) => {
    const rankingPageUpButton = new ButtonBuilder()
        .setCustomId("rankingPageUp")
        .setDisabled(disabled)
        .setLabel(client.i18n.__("ranking.pageUpButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
    
    return rankingPageUpButton;
};

const getRankingPageDownButton = async (client: ExtendedClient, disabled: boolean = false) => {
    const rankingPageDownButton = new ButtonBuilder()
        .setCustomId("rankingPageDown")
        .setDisabled(disabled)
        .setLabel(client.i18n.__("ranking.pageDownButtonLabel"))
        .setStyle(ButtonStyle.Secondary);

    return rankingPageDownButton;
};

const getRankingGuildOnlyButton = async (client: ExtendedClient, newStatus: boolean) => {
    const rankingGuildOnlyButton = new ButtonBuilder()
        .setCustomId("rankingGuildOnly")
        .setLabel(newStatus ? client.i18n.__("ranking.guildOnlyButtonLabel") : client.i18n.__("ranking.allGuildsButtonLabel"))
        .setStyle(newStatus ? ButtonStyle.Success : ButtonStyle.Secondary);

    return rankingGuildOnlyButton;
}

const getCommitsButton = async (client: ExtendedClient) => {
    const commitsButton = new ButtonBuilder()
        .setCustomId("commits")
        .setLabel(client.i18n.__("quickButton.commitsLabel"))
        .setStyle(ButtonStyle.Secondary); 

    return commitsButton;
};

const getHelpButton = async (client: ExtendedClient) => {
    const helpButton = new ButtonBuilder()
        .setCustomId("help")
        .setLabel(`${client.i18n.__("quickButton.helpLabel")} ${getRandomAnimalEmoji()}`)
        .setStyle(ButtonStyle.Success);
    
    return helpButton;
};

const getRepoButton = async (client: ExtendedClient) => {
    const repoUrl = (await import("../../../../package.json")).repository.url;
    const repoButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(repoUrl)
        .setLabel(client.i18n.__("help.repoButtonLabel"));

    return repoButton;
}

const getQuickButtonsRows = async (client: ExtendedClient, message: Message) => {
    const sourceMessage = await getMessage(message.id);

    const row = new ActionRowBuilder<ButtonBuilder>();
    const row2 = new ActionRowBuilder<ButtonBuilder>();

    const profileButton = await getProfileButton(client, sourceMessage?.targetUserId || undefined);
    const guildStatisticsButton = await getGuildStatisticsButton(client);
    const sweepButton = await getSweepButton(client);
    const rankingButton = await getRankingButton(client);
    const commitsButton = await getCommitsButton(client);
    const helpButton = await getHelpButton(client);

    row.setComponents(sweepButton, profileButton, rankingButton);
    row2.setComponents(guildStatisticsButton, commitsButton, helpButton);

    return [row, row2];
}   

export { getExitButton, getRepoButton, getRankingGuildOnlyButton, getHelpButton, getRankingPageUpButton, getRankingPageDownButton, getAutoSweepingButton, getRoleColorUpdateButton, getRoleColorSwitchButton, getQuickButtonsRows, getNotificationsButton, getStatisticsNotificationButton, getLevelRolesButton, getLevelRolesHoistButton, getProfileTimePublicButton };