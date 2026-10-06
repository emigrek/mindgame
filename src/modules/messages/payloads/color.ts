import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { getRoleColorDisableButton, getRoleColorPickButton, getRoleColorUpdateButton } from "@/modules/messages/buttons";
import { getMemberColorRole } from "@/modules/roles";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, CommandInteraction, GuildMember, ModalSubmitInteraction } from "discord.js";
import { GetColorName } from 'hex-color-to-color-name';
import { InformationEmbed } from "@/modules/messages/embeds";

import { colorStore } from "@/stores/colorStore";
import { useImageHex, getColorInt } from "@/modules/messages/colors";
import { getErrorMessagePayload } from "@/modules/messages/error";

const getColorMessagePayload = async (client: ExtendedClient, interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction) => {
    const colorState = colorStore.get(interaction.user.id);

    if (!interaction.guild)
        return getErrorMessagePayload();

    const roleColor = await getMemberColorRole(interaction.member as GuildMember);
    if (!colorState.color) {
        const defaultColor = roleColor
            ? roleColor.hexColor
            : await useImageHex(interaction.user.avatarURL({ extension: "png" })).then(color => color.Vibrant);
        colorState.color = defaultColor;
    }

    const roleColorUpdateButton = getRoleColorUpdateButton();
    const roleColorPickButton = getRoleColorPickButton();
    const row = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(roleColorPickButton, roleColorUpdateButton);

    if (roleColor) {
        const roleColorDisableButton = getRoleColorDisableButton();
        row.addComponents(roleColorDisableButton);
    }

    const colorImageUrl = `https://singlecolorimage.com/get/${(colorState.color).split("#").at(-1)}/400x400`;

    const embed = InformationEmbed()
        .setColor(getColorInt(colorState.color))
        .setTitle(i18n.__("color.title"))
        .setDescription(i18n.__("color.description"))
        .setThumbnail(colorImageUrl)
        .setFooter({
            iconURL: colorImageUrl,
            text: i18n.__mf("color.current", {
                hex: colorState.color,
                name: GetColorName(colorState.color)
            })
        });

    return {
        embeds: [embed],
        components: [row],
    };
};

export { getColorMessagePayload };
