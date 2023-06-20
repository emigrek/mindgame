import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { inspect } from "util";

const clean = async (input: any, depth: number) => {
    if (input instanceof Promise)
        input = await input;
    
    if (typeof input !== `string`)
        input = inspect(input, { depth });

    input = input
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));

    input = input
        .replaceAll(process.env.DISCORD_TOKEN, "[TOKEN]")

    return input;
};

export const evalCommand: Command = {
    data: new SlashCommandBuilder()
        .setName(`eval`)
        .setDescription(`Evaluate a code snippet`)
        .addStringOption(option =>
            option
                .setName(`code`)
                .setDescription(`Code to evaluate`)
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName(`depth`)
                .setDescription(`Output depth`)
                .setRequired(false)
                .setMinValue(0)
        ),
    options: {
        ownerOnly: true
    },
    execute: async (client, interaction) => {
        const { i18n } = client;
        await interaction.deferReply({ ephemeral: true });

        const code = interaction.options.getString(`code`);
        const depth = interaction.options.getInteger(`depth`);

        const embed = new EmbedBuilder();
        try {
            const evaled = await eval(code ?? '');
            const output = await clean(evaled, depth ?? 0);

            embed
                .setTitle(i18n.__("evaluation.title"))
                .setDescription(`**${i18n.__("evaluation.input")}**\n\`\`\`js\n${code}\n\`\`\`\n**${i18n.__("evaluation.output")}**\n\`\`\`js\n${output}\n\`\`\``)
                .setColor('Blurple');
        } catch (e) {
            embed
                .setTitle(i18n.__("evaluation.title"))
                .setDescription(`**${i18n.__("evaluation.input")}**\n\`\`\`js\n${code}\n\`\`\`\n**${i18n.__("evaluation.output")}**\n\`\`\`js\n${e}\n\`\`\``)
                .setColor('Red');
        }

        await interaction.followUp({ embeds: [embed] });
    }
}