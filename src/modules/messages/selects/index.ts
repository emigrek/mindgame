import { StringSelectMenuBuilder, TextChannel } from "discord.js";
import ExtendedClient from "../../../client/ExtendedClient";
import { SelectMenuOption } from "../../../interfaces";

const getChannelSelect = async (client: ExtendedClient, currentDefault: TextChannel, options: SelectMenuOption[]) => {
    const channelSelect = new StringSelectMenuBuilder()
        .setCustomId("defaultChannelSelect")
        .setPlaceholder(currentDefault ? client.i18n.__mf("config.selectChannelPlaceholder", { channel: currentDefault!.name }) : client.i18n.__("config.selectChannelPlaceholderNoDefault"))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);
    
    return channelSelect;
}

const getLanguageSelect = async (client: ExtendedClient, currentLocale: string, options: SelectMenuOption[]) => {
    const localeSelect = new StringSelectMenuBuilder()
        .setCustomId("localeSelect")
        .setPlaceholder(client.i18n.__mf("config.selectLocalePlaceholder", { locale: currentLocale }))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return localeSelect;
}

export { getChannelSelect, getLanguageSelect };