import i18n from "@/client/i18n";
import {getFollow} from "@/modules/follow";
import {GuildDocument} from "@/modules/schemas/Guild";
import {ButtonBuilder} from "@discordjs/builders";
import {ActionRowBuilder, ButtonStyle} from "discord.js";
import {getRandomEmojiFromGroup, Groups} from "winemoji";

interface NotificationsProps {
    guild: GuildDocument;
}

const getNotificationsButton = ({ guild }: NotificationsProps) => {
    return new ButtonBuilder()
        .setCustomId("notifications")
        .setLabel(i18n.__("config.notificationsButtonLabel"))
        .setStyle(guild.notifications ? ButtonStyle.Success : ButtonStyle.Secondary);
}

const getAutoSweepingButton = ({ guild }: NotificationsProps) => {
    return new ButtonBuilder()
        .setCustomId("autoSweeping")
        .setLabel(i18n.__("config.autoSweepingButtonLabel"))
        .setStyle(guild.autoSweeping ? ButtonStyle.Success : ButtonStyle.Secondary);
}

const getLevelRolesButton = ({ guild }: NotificationsProps) => {
    return new ButtonBuilder()
        .setCustomId("levelRoles")
        .setLabel(i18n.__("config.levelRolesButtonLabel"))
        .setStyle(guild.levelRoles ? ButtonStyle.Success : ButtonStyle.Secondary);
}

const getLevelRolesHoistButton =  ({ guild }: NotificationsProps) => {
    return new ButtonBuilder()
        .setCustomId("levelRolesHoist")
        .setLabel(i18n.__("config.levelRolesHoistButtonLabel"))
        .setStyle(guild.levelRolesHoist ? ButtonStyle.Success : ButtonStyle.Secondary);
}

interface ProfileTimePublicButtonProps {
    isPublic: boolean;
}

const getProfileTimePublicButton = ({ isPublic }: ProfileTimePublicButtonProps) => {
    return new ButtonBuilder()
        .setCustomId("profileTimePublic")
        .setLabel(i18n.__("profile.timePublicButtonLabel"))
        .setStyle(isPublic ? ButtonStyle.Success : ButtonStyle.Secondary);
}

interface ProfileFollowButtonProps {
    sourceUserId: string;
    targetUserId: string;
}

const getProfileFollowButton = async ({ sourceUserId, targetUserId }: ProfileFollowButtonProps) => {
    const following = await getFollow(sourceUserId, targetUserId);

    return new ButtonBuilder()
        .setCustomId("profileFollow")
        .setLabel(following ? i18n.__("profile.unfollowButtonLabel") : i18n.__("profile.followButtonLabel"))
        .setStyle(following ? ButtonStyle.Danger : ButtonStyle.Primary);
}

const getRoleColorPickButton = () => {
    return new ButtonBuilder()
        .setCustomId("roleColorPick")
        .setLabel(i18n.__("color.roleColorPickButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
}

const getRoleColorUpdateButton = () => {
    return new ButtonBuilder()
        .setCustomId("roleColorUpdate")
        .setLabel(i18n.__("color.roleColorUpdateButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
}

const getRoleColorDisableButton = () => {
    return new ButtonBuilder()
        .setCustomId("roleColorDisable")
        .setLabel(i18n.__("color.roleColorDisableButtonLabel"))
        .setStyle(ButtonStyle.Danger)
}

const getProfileButton = () => {
    return new ButtonBuilder()
        .setCustomId("profile")
        .setLabel(i18n.__("quickButton.profileLabel"))
        .setStyle(ButtonStyle.Primary);
}

const getSweepButton = () => {
    return new ButtonBuilder()
        .setCustomId("sweep")
        .setLabel(i18n.__("quickButton.sweepLabel"))
        .setStyle(ButtonStyle.Secondary);
};

const getRankingButton = () => {
    return new ButtonBuilder()
        .setCustomId("ranking")
        .setLabel(i18n.__("quickButton.rankingLabel"))
        .setStyle(ButtonStyle.Primary);
};

const getRankingPageUpButton = (disabled = false) => {
    return new ButtonBuilder()
        .setCustomId("rankingPageUp")
        .setDisabled(disabled)
        .setLabel(i18n.__("ranking.pageUpButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
};

const getRankingPageDownButton = (disabled = false) => {
    return new ButtonBuilder()
        .setCustomId("rankingPageDown")
        .setDisabled(disabled)
        .setLabel(i18n.__("ranking.pageDownButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
};

const getRankingSettingsButton = () => {
    return new ButtonBuilder()
        .setCustomId("rankingSettings")
        .setLabel(i18n.__("ranking.settingsButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
};

const getHelpButton = () => {
    return new ButtonBuilder()
        .setCustomId("help")
        .setLabel(`${i18n.__("quickButton.helpLabel")} ${getRandomEmojiFromGroup(Groups.AnimalsAndNature).char}`)
        .setStyle(ButtonStyle.Success);
};

const getRepoButton = async () => {
    const repoUrl = (await import("../../../../package.json")).repository.url;
    return new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(repoUrl)
        .setLabel(i18n.__("help.repoButtonLabel"));
}

const getQuickButtonsRows = async () => {
    const row = new ActionRowBuilder<ButtonBuilder>();

    const profileButton = getProfileButton();
    const sweepButton = getSweepButton();
    const rankingButton = getRankingButton();
    const helpButton = getHelpButton();

    row.setComponents(sweepButton, profileButton, rankingButton, helpButton);

    return [row];
}

const getSelectMessageDeleteButton = (disabled: boolean) => {
    return new ButtonBuilder()
        .setCustomId("selectMessageDelete")
        .setLabel(i18n.__("select.messageDeleteButtonLabel"))
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled);
}

const getSelectRerollButton = (disabled: boolean) => {
    return new ButtonBuilder()
        .setCustomId("selectReroll")
        .setLabel(i18n.__("select.rerollButtonLabel"))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
}

export { getAutoSweepingButton, getHelpButton, getLevelRolesButton, getLevelRolesHoistButton, getNotificationsButton, getProfileFollowButton, getProfileTimePublicButton, getQuickButtonsRows, getRankingPageDownButton, getRankingPageUpButton, getRankingSettingsButton, getRepoButton, getRoleColorDisableButton, getRoleColorPickButton, getRoleColorUpdateButton, getSelectMessageDeleteButton, getSelectRerollButton };

