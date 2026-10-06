import { Button } from "@/interfaces";
import { getColorMessagePayload, useImageHex } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { deleteMemberColorRole } from "@/modules/roles";
import { GuildMember, MessageFlags } from "discord.js";
import i18n from "@/client/i18n";
import { colorStore } from "@/stores/colorStore";

const roleColorDisable: Button = {
    customId: `roleColorDisable`,
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        if (!interaction.guild) {
            await interaction.followUp({ embeds: [
                WarningEmbed()
                    .setDescription(i18n.__("utils.guildOnly"))
            ], flags: MessageFlags.Ephemeral });
            return;
        }

        const colorState = colorStore.get(interaction.user.id);
        const defaultColor = await useImageHex(interaction.user.avatarURL({ extension: "png" }))
            .then((color) => color.Vibrant);

        await deleteMemberColorRole(interaction.member as GuildMember)
            .catch(async () => {
                await interaction.followUp({ embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("roles.missingPermissions"))
                ], flags: MessageFlags.Ephemeral });
            });

        colorState.color = defaultColor;

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(colorMessagePayload);
    }
}

export default roleColorDisable;