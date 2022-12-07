import { Command } from "../interfaces/Command";
import { sendConfigMessage } from "../modules/messages";
import { SlashCommandBuilder } from "@discordjs/builders";

export const config: Command = {
    data: new SlashCommandBuilder()
        .setName(`config`)
        .setDescription(`Sends config message.`),
    execute: async (client, interaction) => {
        if(interaction.guild?.ownerId != interaction.user.id) {
            interaction.reply({ content: client.i18n.__("utils.noPermissions"), ephemeral: true });
            return;
        }
        
        sendConfigMessage(client, interaction.guild!);
    }
}