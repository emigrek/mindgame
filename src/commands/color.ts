import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { updateUserStatistics } from "../modules/user";
import { getColorMessagePayload } from "../modules/messages";

export const color: Command = {
    data: new SlashCommandBuilder()
        .setName(`color`)
        .setDescription(`Set up your custom color role`),
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guild) {
            await interaction.followUp(client.i18n.__("utils.guildOnly"));
            return;
        }

        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.followUp(colorMessagePayload);
    }
}