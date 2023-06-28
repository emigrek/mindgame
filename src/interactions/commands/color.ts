import { Command } from "@/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getColorMessagePayload } from "@/modules/messages";
import i18n from "@/client/i18n";

export const color: Command = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription(i18n.__("commandLocalizations.color.description"))
        .setDMPermission(false),
    options: {
        level: 60
    },
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.followUp(colorMessagePayload);
    }
}