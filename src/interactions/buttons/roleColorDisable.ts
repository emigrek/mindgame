import { Button } from "@/interfaces";
import { getColorMessagePayload, useImageHex } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { getMemberColorRole } from "@/modules/roles";
import { GuildMember } from "discord.js";
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
            ], ephemeral: true });
            return;
        }

        const colorState = colorStore.get(interaction.user.id);
        const roleColor = getMemberColorRole(interaction.member as GuildMember);
        const defaultColor = await useImageHex(interaction.user.avatarURL({ extension: "png" }))
            .then((color) => color.Vibrant);

        if(roleColor) {
            await roleColor.delete()
                .catch(async () => {
                    await interaction.followUp({ embeds: [
                        WarningEmbed()
                            .setDescription(i18n.__("roles.missingPermissions"))
                    ], ephemeral: true });
                });
        }

        colorState.color = defaultColor;

        const colorMessagePayload = await getColorMessagePayload(client, interaction);
        await interaction.editReply(colorMessagePayload);
    }
}

export default roleColorDisable;