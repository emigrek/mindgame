import { Command } from "../interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";

const clean = async (input: any, depth: number) => {
    if (input instanceof Promise) input = await input;
    if (typeof input !== `string`) input = require(`util`).inspect(input, { depth: depth });

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
    execute: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        if (!process.env.OWNER_ID) {
            await interaction.followUp({ content: `If you are the bot owner, please set the OWNER_ID environment variable.` });
            return;
        }

        if (process.env.OWNER_ID !== interaction.user.id) {
            await interaction.followUp({ content: `You are not the bot owner.` });
            return;
        }

        const code = interaction.options.getString(`code`);
        const depth = interaction.options.getInteger(`depth`);
        if (!code) {
            await interaction.followUp({ content: `No code provided.` });
            return;
        }

        const embed = new EmbedBuilder();
        try {
            const evaled = await eval(code);
            const output = await clean(evaled, depth ?? 0);

            embed
                .setTitle(`Evaluation`)
                .setDescription(`**Output**\n\`\`\`js\n${output}\n\`\`\``)
                .setColor('Blurple');
        } catch (e) {
            embed
                .setTitle(`Evaluation`)
                .setDescription(`**Output**\n\`\`\`js\n${e}\n\`\`\``)
                .setColor('Red');
        }

        await interaction.followUp({ embeds: [embed] });
    }
}