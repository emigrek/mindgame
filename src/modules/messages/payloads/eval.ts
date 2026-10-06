import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import clean from "@/utils/clean";
import { ChatInputCommandInteraction, EmbedBuilder, bold } from "discord.js";

import Colors from "@/utils/colors";

const truncate = (text: string, length: number) => text.length > length ? `${text.slice(0, length)}…` : text;

const getEvalMessagePayload = async (client: ExtendedClient, interaction: ChatInputCommandInteraction) => {
    const code = interaction.options.getString(`code`);
    const depth = interaction.options.getInteger(`depth`);

    const embed = new EmbedBuilder();
    try {
        const result = await eval(code ?? '');
        // The embed description is limited to 4096 characters, a longer one failed to send anything back
        const output = truncate(await clean(result, depth ?? 0), 3000);

        embed
            .setTitle(i18n.__("evaluation.title"))
            .setDescription(`${bold(i18n.__("evaluation.input"))}\n\`\`\`js\n${truncate(code ?? "", 800)}\n\`\`\`\n${bold(i18n.__("evaluation.output"))}\n\`\`\`js\n${output}\n\`\`\``)
            .setColor(Colors.Blurple);
    } catch (e) {
        embed
            .setTitle(i18n.__("evaluation.title"))
            .setDescription(`${bold(i18n.__("evaluation.input"))}\n\`\`\`js\n${truncate(code ?? "", 800)}\n\`\`\`\n${bold(i18n.__("evaluation.output"))}\n\`\`\`js\n${truncate(String(e), 3000)}\n\`\`\``)
            .setColor(Colors.Red);
    }

    return {
        embeds: [embed]
    }
};

export { getEvalMessagePayload };
