import { Button } from "@/interfaces";
import { useImageHex } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { getColorPickerModal } from "@/modules/messages/modals";
import { getMemberColorRole } from "@/modules/roles";
import { colorStore } from "@/stores/colorStore";
import { GuildMember } from "discord.js";
import i18n from "@/client/i18n";

const roleColorPick: Button = {
    customId: `roleColorPick`,
    run: async (client, interaction) => {
        if (!interaction.guild) {
            await interaction.followUp({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("utils.guildOnly"))
                ], ephemeral: true
            });
            return;
        }

        const colorState = colorStore.get(interaction.user.id);
        const roleColor = getMemberColorRole(interaction.member as GuildMember);
        const defaultColor = await useImageHex(interaction.user.avatarURL({ extension: "png" }))
            .then(color => color.Vibrant);

        if (!colorState.color) {
            colorState.color = roleColor ? roleColor.hexColor : defaultColor;
        }

        await interaction.showModal(getColorPickerModal(colorState.color));
    }
}

export default roleColorPick;