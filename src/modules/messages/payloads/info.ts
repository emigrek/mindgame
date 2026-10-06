import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { getRepoButton } from "@/modules/messages/buttons";
import { getLastCommits } from "@/utils/commits";
import { ActionRowBuilder, ButtonBuilder, EmbedField, codeBlock } from "discord.js";
import moment from "moment";
import { InformationEmbed } from "@/modules/messages/embeds";

import { KnownLinks } from "@/modules/messages/knownLinks";
import { useImageHex, getColorInt } from "@/modules/messages/colors";
import { getErrorMessagePayload } from "@/modules/messages/error";

const getCommitsMessagePayload = async (client: ExtendedClient) => {
    const projectPackage = await import("../../../../package.json");
    const repo = projectPackage.repository.url.split("/").slice(-2).join("/");

    const commits = await getLastCommits(repo, 6)
        .catch(() => {
            return null;
        });

    if (!commits)
        return getErrorMessagePayload();

    // author is null for commits whose email isn't linked to a GitHub account
    const fields: EmbedField[] = commits.map((commit: any) => ({
        name: commit.author?.login ?? commit.commit.author?.name ?? "?",
        value: `${codeBlock(commit.commit.message.split("\n")[0].slice(0, 200))}[commit](${commit.html_url}) - ${moment(commit.commit.author.date).format("DD/MM/YYYY HH:mm")}`,
        inline: true
    }));

    const embed = InformationEmbed()
        .setTitle(i18n.__mf("commits.title", { count: commits.length }))
        .setFields(fields)
        .setFooter({
            iconURL: client.user?.avatarURL({ extension: "png" }) || undefined,
            text: `${projectPackage.name.charAt(0).toUpperCase() + projectPackage.name.slice(1)} (v.${projectPackage.version})`
        })

    return {
        embeds: [embed]
    };
};

const getHelpMessagePayload = async (client: ExtendedClient) => {
    const clientUserAvatar = client.user?.avatarURL({
        extension: "png"
    }) || null;
    const color = await useImageHex(clientUserAvatar);

    const embed = InformationEmbed()
        .setColor(getColorInt(color.Vibrant))
        .setTitle(i18n.__("help.title"))
        .setDescription(i18n.__("help.description"))
        .setFields([
            {
                name: i18n.__("help.faqQuestion1"),
                value: codeBlock(i18n.__("help.faqAnswer1")),
                inline: true
            },
            {
                name: i18n.__("help.faqQuestion2"),
                value: codeBlock(i18n.__("help.faqAnswer2")),
                inline: true
            },
            {
                name: i18n.__("help.faqQuestion3"),
                value: codeBlock(i18n.__("help.faqAnswer3")),
            }
        ])
        .setThumbnail(clientUserAvatar)
        .setImage(KnownLinks.QUICK_BUTTONS)
        .setFooter({
            text: i18n.__("help.footer")
        });

    const repoButton = await getRepoButton();
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(repoButton);

    return {
        embeds: [embed],
        components: [row]
    }
}

export { getCommitsMessagePayload, getHelpMessagePayload };
