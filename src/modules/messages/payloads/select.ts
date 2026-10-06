import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { getSelectMessageDeleteButton, getSelectRerollButton } from "@/modules/messages/buttons";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, codeBlock } from "discord.js";
import { InformationEmbed } from "@/modules/messages/embeds";

import { selectOptionsStore } from "@/stores/selectOptionsStore";

const getSelectMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction | ButtonInteraction | ModalSubmitInteraction, reveal?: boolean) => {
    const selectOptionsState = selectOptionsStore.get(interaction.user.id);

    const selected = reveal ? selectOptionsState.options[Math.floor(Math.random() * selectOptionsState.options.length)] : '';
    if (reveal) {
        selectOptionsState.results = [...selectOptionsState.results, selected];
    }

    // TODO
    // Do this more efficiently
    const optionsSorted = selectOptionsState.options.sort((a: string, b: string) => {
        const aCount = selectOptionsState.results.filter((result: string) => result === a).length;
        const bCount = selectOptionsState.results.filter((result: string) => result === b).length;

        return bCount - aCount;
    });

    const embed = InformationEmbed()
        .setTitle(reveal ? `🎯  ${selected}` : `✨  ${i18n.__("select.selecting")}`)
        .setDescription(i18n.__("select.description"))
        .setFields(
            optionsSorted.map((option: string, index) => {
                const count = selectOptionsState.results.filter((result: string) => result === option).length;
                return {
                    name: `${index + 1}. ${option}`,
                    value: count ? codeBlock(count.toString()) : codeBlock(`\u200b`),
                    inline: true
                }
            })
        )

    const selectMessageDeleteButton = getSelectMessageDeleteButton(!reveal);
    const selectRerollButton = getSelectRerollButton(!reveal);
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(selectRerollButton, selectMessageDeleteButton);

    return {
        embeds: [embed],
        components: [row]
    };
}

export { getSelectMessagePayload };
