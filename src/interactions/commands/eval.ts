import { Command } from "@/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { getEvalMessagePayload } from "@/modules/messages";
import i18n from "@/client/i18n";

export const evalCommand: Command = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription(i18n.__("commandLocalizations.eval.description"))
        .addStringOption(option =>
            option
                .setName("code")
                .setDescription(i18n.__("commandLocalizations.eval.subcommand.code.description"))
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("depth")
                .setDescription(i18n.__("commandLocalizations.eval.subcommand.depth.description"))
                .setRequired(false)
                .setMinValue(0)
        ),
    options: {
        ownerOnly: true
    },
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const evalMessagePayload = await getEvalMessagePayload(client, interaction);
        await interaction.followUp(evalMessagePayload);
    }
}