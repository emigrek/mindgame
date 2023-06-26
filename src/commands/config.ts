import i18n from "../client/i18n";
import { Command } from "../interfaces";
import { getConfigMessagePayload } from "../modules/messages";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";

export const config: Command = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription(i18n.__("commandLocalizations.config.description"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const configMessagePayload = await getConfigMessagePayload(client, interaction);
        await interaction.followUp(configMessagePayload);
    }
}