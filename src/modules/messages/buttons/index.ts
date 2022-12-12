import ExtendedClient from "../../../client/ExtendedClient";
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { Guild } from "../../../interfaces";

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

export { getExitButton, getNotificationsButton };