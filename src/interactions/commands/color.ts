import { InteractionContextType, MessageFlags } from "discord.js";
import { Command } from "@/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getColorMessagePayload } from "@/modules/messages";
import i18n from "@/client/i18n";

export const color: Command = {
    data: new SlashCommandBuilder()
        .setName("color")
        .setDescription(i18n.__("commandLocalizations.color.description"))
        .setContexts(InteractionContextType.Guild),
    options: {
        level: 60
    },
    execute: async (client, interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.followUp(colorMessagePayload);
    }
}