import ExtendedClient from "../../../client/ExtendedClient";
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle, Collection, Guild } from "discord.js";
import { Guild as DatabaseGuild, User } from "../../../interfaces";

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

const getQuickButtons = async (client: ExtendedClient, guild: Guild) => {
    const profileButon = new ButtonBuilder()
        .setCustomId("profile")
        .setLabel(client.i18n.__("quickButton.profileLabel"))
        .setStyle(ButtonStyle.Primary);
    
    const statisticsButton = new ButtonBuilder()
        .setCustomId("guildStatistics")
        .setLabel(client.i18n.__("quickButton.guildStatisticsLabel"))
        .setStyle(ButtonStyle.Secondary);

    const sweepButton = new ButtonBuilder()
        .setCustomId("sweep")
        .setLabel(client.i18n.__("quickButton.sweepLabel"))
        .setStyle(ButtonStyle.Secondary);

    const quickButtonsCollection: Collection<string, ButtonBuilder> = new Collection();
    
    quickButtonsCollection.set("sweep", sweepButton);
    quickButtonsCollection.set("profile", profileButon);
    quickButtonsCollection.set("statistics", statisticsButton);

    return quickButtonsCollection;
}   

export { getExitButton, getAutoSweepingButton, getQuickButtons, getNotificationsButton, getStatisticsNotificationButton, getLevelRolesButton, getLevelRolesHoistButton, getProfileTimePublicButton };