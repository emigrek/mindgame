import { StringSelectMenuBuilder, TextChannel } from "discord.js";
import ExtendedClient from "../../../client/ExtendedClient";
import { SelectMenuOption, Sorting } from "../../../interfaces";

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

const getRankingSortSelect = async (client: ExtendedClient, sorting: Sorting, options: SelectMenuOption[]) => {
    const rankingSortSelect = new StringSelectMenuBuilder()
        .setCustomId("rankingSortSelect")
        .setPlaceholder(client.i18n.__mf("ranking.rankingSortSelect", { sort: `${sorting.label.toUpperCase()} (${sorting.range.toUpperCase()})` }))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return rankingSortSelect;
};

export { getChannelSelect, getLanguageSelect, getRankingSortSelect };