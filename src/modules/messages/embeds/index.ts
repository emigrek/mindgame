import { KnownLinks } from "@/modules/messages/knownLinks";
import { UserDocument } from "@/modules/schemas/User";
import Colors from "@/utils/colors";
import { EmbedBuilder } from "discord.js";
import { ImageHexColors, getColorInt } from "..";

interface BaseProfileProps {
    user: UserDocument;
    colors: ImageHexColors;
}

const BaseProfileEmbed = ({ colors, user }: BaseProfileProps) => {
    const embed = new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setTitle(user.username)
        .setThumbnail(user.avatarUrl)
        .setDescription(`** **`)
        .setImage(KnownLinks.EMBED_SPACER);

    return embed;
};

const InformationEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.EmbedGray);

    return embed;
};

const ErrorEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.Red);

    return embed;
};

const WarningEmbed = () => {
    const embed = new EmbedBuilder()
        .setColor(Colors.Yellow);

    return embed;
};

export { BaseProfileEmbed, ErrorEmbed, InformationEmbed, WarningEmbed };

