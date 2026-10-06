import { Button } from "@/interfaces";
import { useImageHex } from "@/modules/messages";
import { WarningEmbed } from "@/modules/messages/embeds";
import { getColorPickerModal } from "@/modules/messages/modals";
import { getMemberColorRole } from "@/modules/roles";
import { colorStore } from "@/stores/colorStore";
import { GuildMember, MessageFlags } from "discord.js";
import i18n from "@/client/i18n";

const roleColorPick: Button = {
    customId: `roleColorPick`,
    run: async (client, interaction) => {
        if (!interaction.guild) {
            await interaction.reply({
                embeds: [
                    WarningEmbed()
                        .setDescription(i18n.__("utils.guildOnly"))
                ], flags: MessageFlags.Ephemeral
            });
            return;
        }

        // showModal must be the first response within 3s, so skip the avatar download when /color already picked a color
        const colorState = colorStore.get(interaction.user.id);
        if (!colorState.color) {
            const roleColor = await getMemberColorRole(interaction.member as GuildMember);
            const defaultColor = roleColor
                ? roleColor.hexColor
                : await useImageHex(interaction.user.avatarURL({ extension: "png" })).then(colors => colors.Vibrant);
            colorState.color = defaultColor;
        }

        await interaction.showModal(getColorPickerModal(colorState.color));
    }
}

export default roleColorPick;