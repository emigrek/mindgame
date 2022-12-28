import ExtendedClient from "../../../client/ExtendedClient";
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { Guild, User } from "../../../interfaces";

const getExitButton = async (client: ExtendedClient) => {
    const exitButton = new ButtonBuilder()
        .setCustomId("remove")
        .setLabel(client.i18n.__("config.close"))
        .setStyle(ButtonStyle.Danger);

    return exitButton;
}

const getNotificationsButton = async (client: ExtendedClient, sourceGuild: Guild) => {
    const notificationsButton = new ButtonBuilder()
        .setCustomId("notifications")
        .setLabel(client.i18n.__("config.notificationsButtonLabel"))
        .setStyle(sourceGuild!.notifications ? ButtonStyle.Success : ButtonStyle.Secondary);

    return notificationsButton;
}

const getLevelRolesButton = async (client: ExtendedClient, sourceGuild: Guild) => {
    const levelRolesButton = new ButtonBuilder()
        .setCustomId("levelRoles")
        .setLabel(client.i18n.__("config.levelRolesButtonLabel"))
        .setStyle(sourceGuild!.levelRoles ? ButtonStyle.Success : ButtonStyle.Secondary);

    return levelRolesButton;
}

const getLevelRolesHoistButton = async (client: ExtendedClient, sourceGuild: Guild) => {
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

export { getExitButton, getNotificationsButton, getLevelRolesButton, getLevelRolesHoistButton, getProfileTimePublicButton };