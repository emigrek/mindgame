import { StringSelectMenuInteraction } from "discord.js";
import { Interaction } from "../../interfaces";
import { setDefaultChannelId } from "../../modules/guild";
import { withGuildLocale } from "../../modules/locale";

export const defaultChannelSelect: Interaction = {
    customId: "defaultChannelSelect",
    run: async (client, interaction) => {
        if(!(interaction instanceof StringSelectMenuInteraction)) return;

        if(interaction.guild?.ownerId != interaction.user.id) {
            interaction.reply({ content: client.i18n.__("utils.noPermissions"), ephemeral: true });
            return;
        }

        const guild = interaction.guild;
        const selected = interaction.values[0];
        withGuildLocale(client, guild);
        
        const success = await setDefaultChannelId(guild, selected);

        if(success) await interaction.reply({ content: client.i18n.__mf("config.defaultChannelSuccess", { selected: selected }), ephemeral: true });
        else await interaction.reply({ content: client.i18n.__("config.defaultChannelError"), ephemeral: true });
    }
}