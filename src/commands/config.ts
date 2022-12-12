import { Command } from "../interfaces";
import { getConfigMessagePayload } from "../modules/messages";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";

export const config: Command = {
    data: new SlashCommandBuilder()
        .setName(`config`)
        .setDescription(`Sends guild config message.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (client, interaction) => {
        await interaction.deferReply();
        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        interaction.followUp(configMessage!);
    }
}