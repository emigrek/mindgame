import { Command } from "@/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import i18n from "@/client/i18n";
import { getSelectMessagePayload } from "@/modules/messages";

export const select: Command = {
    data: new SlashCommandBuilder()
        .setName("select")
        .setDescription(i18n.__("commandLocalizations.select.description"))
        .addStringOption(option =>
            option
                .setName(i18n.__("commandLocalizations.select.subcommand.options.name"))
                .setDescription(i18n.__("commandLocalizations.select.subcommand.options.description"))
                .setRequired(true)
        ),
    execute: async (client, interaction) => {
        await interaction.deferReply();
        const selectMessagePayload = await getSelectMessagePayload(client, interaction);
        await interaction.followUp(selectMessagePayload);
    }
}