import i18n from "@/client/i18n";
import { SelectMenuOption, Sorting } from "@/interfaces";
import { StringSelectMenuBuilder, TextChannel, UserSelectMenuBuilder } from "discord.js";

const getUserPageSelect = async (placeholder: string, options: SelectMenuOption[]) => {
    const userPageSelect = new StringSelectMenuBuilder()
        .setCustomId("profileEmbedSelect")
        .setMinValues(1)
        .addOptions(options)
        .setPlaceholder(placeholder)

    return userPageSelect;
};

const getChannelSelect = async (currentDefault: TextChannel, options: SelectMenuOption[]) => {
    const channelSelect = new StringSelectMenuBuilder()
        .setCustomId("defaultChannelSelect")
        .setPlaceholder(currentDefault ? i18n.__mf("config.selectChannelPlaceholder", { channel: currentDefault?.name || '?' }) : i18n.__("config.selectChannelPlaceholderNoDefault"))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);
    
    return channelSelect;
}

const getRankingSortSelect = async (sorting: Sorting, options: SelectMenuOption[]) => {
    const rankingSortSelect = new StringSelectMenuBuilder()
        .setCustomId("rankingSortSelect")
        .setPlaceholder(i18n.__(`rankingSortings.label.${sorting.type}`))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return rankingSortSelect;
};

const getRankingRangeSelect = async (sorting: Sorting, options: SelectMenuOption[]) => {
    const rankingRangeSelect = new StringSelectMenuBuilder()
        .setCustomId("rankingRangeSelect")
        .setPlaceholder(i18n.__(`rankingSortings.range.${sorting.range}`))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    return rankingRangeSelect;
};

const getRankingUsersSelect = () => {
    const rankingUsersSelect = new UserSelectMenuBuilder()
        .setCustomId("rankingUsersSelect")
        .setPlaceholder(i18n.__("ranking.selectUsersPlaceholder"))
        .setMinValues(0)
        .setMaxValues(25);
        
    return rankingUsersSelect;
};

export { getChannelSelect, getRankingRangeSelect, getRankingSortSelect, getRankingUsersSelect, getUserPageSelect };

