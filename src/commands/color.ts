import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { updateUserStatistics } from "../modules/user";
import { getColorMessagePayload, getErrorMessagePayload } from "../modules/messages";
import { withGuildLocale } from "../modules/locale";

export const color: Command = {
    data: new SlashCommandBuilder()
        .setName(`color`)
        .setDescription(`Set up your custom color role`),
    execute: async (client, interaction) => {
        if(!interaction.guild) return;
        await interaction.deferReply({ ephemeral: true });
        await withGuildLocale(client, interaction.guild!);
        await updateUserStatistics(client, interaction.user, {
            commands: 1
        });

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        if(!colorMessagePayload) {
            const errorMessage = getErrorMessagePayload(client);
            await interaction.followUp(errorMessage);
            return;
        }

        await interaction.followUp(colorMessagePayload);
    }
}