import i18n from "@/client/i18n";
import {SelectMenuOption, Sorting} from "@/interfaces";
import {UserDocument} from "@/modules/schemas/User";
import {UserSelectMenuBuilder} from "@discordjs/builders";
import {StringSelectMenuBuilder, TextChannel} from "discord.js";


const getUserPageSelect = async (placeholder: string, options: SelectMenuOption[]) => {
    return new StringSelectMenuBuilder()
        .setCustomId("profileEmbedSelect")
        .setMinValues(1)
        .addOptions(options)
        .setPlaceholder(placeholder);
};

const getChannelSelect = async (currentDefault: TextChannel, options: SelectMenuOption[]) => {
    return new StringSelectMenuBuilder()
        .setCustomId("defaultChannelSelect")
        .setPlaceholder(currentDefault ? i18n.__mf("config.selectChannelPlaceholder", {channel: currentDefault?.name || '?'}) : i18n.__("config.selectChannelPlaceholderNoDefault"))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);
}

const getRankingSortSelect = async (sorting: Sorting, options: SelectMenuOption[]) => {
    return new StringSelectMenuBuilder()
        .setCustomId("rankingSortSelect")
        .setPlaceholder(i18n.__(`rankingSortings.label.${sorting.type}`))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);
};

const getRankingRangeSelect = async (sorting: Sorting, options: SelectMenuOption[]) => {
    return new StringSelectMenuBuilder()
        .setCustomId("rankingRangeSelect")
        .setPlaceholder(i18n.__(`rankingSortings.range.${sorting.range}`))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);
};

const getRankingUsersSelect = (defaultUsers: string[]) => {
    return new UserSelectMenuBuilder()
        .setCustomId("rankingUsersSelect")
        .setPlaceholder(i18n.__("ranking.selectUsersPlaceholder"))
        .setDefaultUsers(defaultUsers)
        .setMinValues(0)
        .setMaxValues(25);
};

const getProfileUserSelect = (renderedUser: UserDocument) => {
    return new UserSelectMenuBuilder()
        .setCustomId("profileUserSelect")
        .setPlaceholder(renderedUser.username)
        .setDefaultUsers([renderedUser.userId])
        .setMinValues(1)
        .setMaxValues(1);
}

export { getChannelSelect, getProfileUserSelect, getRankingRangeSelect, getRankingSortSelect, getRankingUsersSelect, getUserPageSelect };

