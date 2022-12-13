import ExtendedClient from "../../client/ExtendedClient";
import { Embed, EmbedData, Guild } from "discord.js";
import Vibrant = require('node-vibrant');
import chroma = require('chroma-js');

const useImageHex = async (image: string) => {
    const colors = await Vibrant.from(image).getPalette();
    const color = chroma(colors.Vibrant!.hex!).hex();
    return parseInt(color.slice(1), 16);
}

const getConfigEmbed = async (client: ExtendedClient, guild: Guild) => {
    const guildIcon = guild.iconURL({ extension: "png"})!;
    const color = await useImageHex(guildIcon);

    const embed = {      
        title: guild.name,
        color: color,
        description: client.i18n.__("config.headerSubtitle"),
        thumbnail: {
            url: guildIcon
        }
    }

    return embed;
}

export { getConfigEmbed, useImageHex };