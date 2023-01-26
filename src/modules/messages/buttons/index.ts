import ExtendedClient from "../../../client/ExtendedClient";
import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonStyle, Message, UserResolvable } from "discord.js";
import { Guild as DatabaseGuild, User } from "../../../interfaces";
import { getMessage } from "..";

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
            .setStyle(ButtonStyle.Success);

        return profileButton;
    }

    profileButton = new ButtonBuilder()
        .setCustomId("profile")
        .setLabel(client.i18n.__("quickButton.profileLabel"))
        .setStyle(ButtonStyle.Success);

    return profileButton;
}

const getGuildStatisticsButton = async (client: ExtendedClient) => {
    const statisticsButton = new ButtonBuilder()
        .setCustomId("guildStatistics")
        .setLabel(client.i18n.__("quickButton.guildStatisticsLabel"))
        .setStyle(ButtonStyle.Primary);

    return statisticsButton;
}

const getSweepButton = async (client: ExtendedClient) => {
    const sweepButton = new ButtonBuilder()
        .setCustomId("sweep")
        .setLabel(client.i18n.__("quickButton.sweepLabel"))
        .setStyle(ButtonStyle.Secondary);
    
    return sweepButton;
};

const getCommitsButton = async (client: ExtendedClient) => {
    const commitsButton = new ButtonBuilder()
        .setCustomId("commits")
        .setLabel(client.i18n.__("quickButton.commitsLabel"))
        .setStyle(ButtonStyle.Secondary); 

    return commitsButton;
};

const getQuickButtonsRow = async (client: ExtendedClient, message: Message) => {
    const sourceMessage = await getMessage(message.id);

    const row = new ActionRowBuilder<ButtonBuilder>();

    const profileButton = await getProfileButton(client, sourceMessage!.targetUserId || undefined);
    const guildStatisticsButton = await getGuildStatisticsButton(client);
    const sweepButton = await getSweepButton(client);
    //const commitsButton = await getCommitsButton(client);

    row.setComponents(sweepButton, profileButton, guildStatisticsButton);

    return row;
}   

export { getExitButton, getAutoSweepingButton, getRoleColorUpdateButton, getRoleColorSwitchButton, getQuickButtonsRow, getNotificationsButton, getStatisticsNotificationButton, getLevelRolesButton, getLevelRolesHoistButton, getProfileTimePublicButton };