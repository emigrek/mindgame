import { Command } from "../interfaces";
import { getConfigMessagePayload, getErrorMessagePayload } from "../modules/messages";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import { updateUserStatistics } from "../modules/user";

export const config: Command = {
    data: new SlashCommandBuilder()
        .setName(`config`)
        .setDescription(`Sends guild config message.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (client, interaction) => {
        if(!interaction.guild) {
            await interaction.reply({ content: `This command can only be used in guilds.`, ephemeral: true });
            return;
        }

        await interaction.deferReply({ ephemeral: true });
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        if(!configMessage) {
            const errorMessage = getErrorMessagePayload(client);
            await interaction.followUp(errorMessage);
            return;
        }

        await interaction.followUp(configMessage);
    }
}