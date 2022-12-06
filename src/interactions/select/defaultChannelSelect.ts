import { StringSelectMenuInteraction } from "discord.js";
import { Interaction } from "../../interfaces";
import { setDefaultChannelId } from "../../modules/guild";

export const defaultChannelSelect: Interaction = {
    customId: "defaultChannelSelect",
    run: async (client, interaction) => {
        if(!(interaction instanceof StringSelectMenuInteraction)) return;

        const selected = interaction.values[0];
        const guild = interaction.guild;

        const success = await setDefaultChannelId(guild, selected);

        await interaction.message.delete();

        if(success) await interaction.reply({ content: `Successfully changed guild default channel to <#${selected}>!`, ephemeral: true });
        else await interaction.reply({ content: "Something went wrong!", ephemeral: true });
    }
}