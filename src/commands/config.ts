import { Command } from "../interfaces";
import { getConfigMessagePayload } from "../modules/messages";
import { SlashCommandBuilder } from "@discordjs/builders";
import { PermissionFlagsBits } from "discord.js";
import { updateUserStatistics } from "../modules/user";

export const config: Command = {
    data: new SlashCommandBuilder()
        .setName(`config`)
        .setDescription(`Sends guild config message.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        if(!interaction.guild) {
            await interaction.followUp(client.i18n.__("utils.guildOnly"));
            return;
        }

        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const configMessage = await getConfigMessagePayload(client, interaction.guild!);
        await interaction.followUp(configMessage);
    }
}