import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import {getFollow} from "@/modules/follow";
import {getMessage} from "@/modules/messages";
import {GuildDocument} from "@/modules/schemas/Guild";
import {ButtonBuilder} from "@discordjs/builders";
import {ActionRowBuilder, ButtonStyle, Message, UserResolvable} from "discord.js";
import {getRandomEmojiFromGroup, Groups} from "winemoji";

interface NotificationsProps {
    guild: GuildDocument;
}

const getNotificationsButton = async ({ guild }: NotificationsProps) => {
    return new ButtonBuilder()
        .setCustomId("notifications")
        .setLabel(i18n.__("config.notificationsButtonLabel"))
        .setStyle(guild.notifications ? ButtonStyle.Success : ButtonStyle.Secondary);
}

const getAutoSweepingButton = async ({ guild }: NotificationsProps) => {
    return new ButtonBuilder()
        .setCustomId("autoSweeping")
        .setLabel(i18n.__("config.autoSweepingButtonLabel"))
        .setStyle(guild.autoSweeping ? ButtonStyle.Success : ButtonStyle.Secondary);
}

const getLevelRolesButton = async ({ guild }: NotificationsProps) => {
    return new ButtonBuilder()
        .setCustomId("levelRoles")
        .setLabel(i18n.__("config.levelRolesButtonLabel"))
        .setStyle(guild.levelRoles ? ButtonStyle.Success : ButtonStyle.Secondary);
}

const getLevelRolesHoistButton =  async ({ guild }: NotificationsProps) => {
    return new ButtonBuilder()
        .setCustomId("levelRolesHoist")
        .setLabel(i18n.__("config.levelRolesHoistButtonLabel"))
        .setStyle(guild.levelRolesHoist ? ButtonStyle.Success : ButtonStyle.Secondary);
}

interface ProfileTimePublicButtonProps {
    isPublic: boolean;
}

const getProfileTimePublicButton = async ({ isPublic }: ProfileTimePublicButtonProps) => {
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

const getRoleColorUpdateButton = async () => {
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

interface ProfileButtonProps {
    client: ExtendedClient;
    targetUserId?: UserResolvable;
}

const getProfileButton = async ({ client, targetUserId }: ProfileButtonProps) => {
    let profileButton;

    if (targetUserId) {
        const targetUser = await client.users.fetch(targetUserId);

        profileButton = new ButtonBuilder()
            .setCustomId("profile")
            .setLabel(i18n.__mf("quickButton.profileTargetLabel", { username: targetUser.username }))
            .setStyle(ButtonStyle.Primary);

        return profileButton;
    }

    profileButton = new ButtonBuilder()
        .setCustomId("profile")
        .setLabel(i18n.__("quickButton.profileLabel"))
        .setStyle(ButtonStyle.Primary);

    return profileButton;
}

const getSweepButton = async () => {
    return new ButtonBuilder()
        .setCustomId("sweep")
        .setLabel(i18n.__("quickButton.sweepLabel"))
        .setStyle(ButtonStyle.Secondary);
};

const getRankingButton = async () => {
    return new ButtonBuilder()
        .setCustomId("ranking")
        .setLabel(i18n.__("quickButton.rankingLabel"))
        .setStyle(ButtonStyle.Primary);
};

const getRankingPageUpButton = async (disabled = false) => {
    return new ButtonBuilder()
        .setCustomId("rankingPageUp")
        .setDisabled(disabled)
        .setLabel(i18n.__("ranking.pageUpButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
};

const getRankingPageDownButton = async (disabled = false) => {
    return new ButtonBuilder()
        .setCustomId("rankingPageDown")
        .setDisabled(disabled)
        .setLabel(i18n.__("ranking.pageDownButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
};

const getRankingSettingsButton = async () => {
    return new ButtonBuilder()
        .setCustomId("rankingSettings")
        .setLabel(i18n.__("ranking.settingsButtonLabel"))
        .setStyle(ButtonStyle.Secondary);
};

const getHelpButton = async () => {
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

const getQuickButtonsRows = async (client: ExtendedClient, message: Message) => {
    const sourceMessage = await getMessage({
        messageId: message.id,
    });

    const row = new ActionRowBuilder<ButtonBuilder>();

    const profileButton = await getProfileButton({ client, targetUserId: sourceMessage?.targetUserId || undefined });
    const sweepButton = await getSweepButton();
    const rankingButton = await getRankingButton();
    const helpButton = await getHelpButton();

    row.setComponents(sweepButton, profileButton, rankingButton, helpButton);

    return [row];
}

const getSelectMessageDeleteButton = async (disabled: boolean) => {
    return new ButtonBuilder()
        .setCustomId("selectMessageDelete")
        .setLabel(i18n.__("select.messageDeleteButtonLabel"))
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled);
}

const getSelectRerollButton = async (disabled: boolean) => {
    return new ButtonBuilder()
        .setCustomId("selectReroll")
        .setLabel(i18n.__("select.rerollButtonLabel"))
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled);
}

export { getAutoSweepingButton, getHelpButton, getLevelRolesButton, getLevelRolesHoistButton, getNotificationsButton, getProfileFollowButton, getProfileTimePublicButton, getQuickButtonsRows, getRankingPageDownButton, getRankingPageUpButton, getRankingSettingsButton, getRepoButton, getRoleColorDisableButton, getRoleColorPickButton, getRoleColorUpdateButton, getSelectMessageDeleteButton, getSelectRerollButton };

