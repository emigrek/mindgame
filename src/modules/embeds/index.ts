import ExtendedClient from "../../client/ExtendedClient";
import { ChannelType, Guild } from "discord.js";
import Vibrant = require('node-vibrant');
import chroma = require('chroma-js');
import * as Canvas from "canvas";

const useImageHex = async (image: string) => {
    const colors = await Vibrant.from(image).getPalette();
    const color = chroma(colors.Vibrant!.hex!).hex();
    return parseInt(color.slice(1), 16);
}

const useEmbedSpacer = async () => {
    const canvas = Canvas.createCanvas(400, 5);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#2f3136";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return {
        attachment: canvas.toBuffer(),
        name: "image.png"
    };
}   

const getConfigEmbed = async (client: ExtendedClient, guild: Guild) => {
    const guildIcon = guild.iconURL({ extension: "png"})!;
    const color = await useImageHex(guildIcon);

    const embed = {      
        title: guild.name,
        color: color,
        thumbnail: {
            url: guildIcon
        },
        image: {
            url: "attachment://image.png"
        },
        fields: [
            {
                name: client.i18n.__("config.membersField"),
                value: `\`\`\`${guild.members.cache.filter(member => !member.user.bot).size}\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("config.textChannelField"),
                value: `\`\`\`${guild.channels.cache.filter(channel => channel.type == ChannelType.GuildText).size}\`\`\``,
                inline: true
            },
            {
                name: client.i18n.__("config.voiceChannelField"),
                value: `\`\`\`${guild.channels.cache.filter(channel => channel.type == ChannelType.GuildVoice).size}\`\`\``,
                inline: true
            }
        ],
        description: `
        ${client.i18n.__("config.headerSubtitle")}
        `,
        footer: {
            text: client.i18n.__("config.footer")
        }
    }

    return embed;
}

export { getConfigEmbed, useImageHex, useEmbedSpacer };