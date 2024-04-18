import {KnownLinks} from "@/modules/messages/knownLinks";
import {UserDocument} from "@/modules/schemas/User";
import Colors from "@/utils/colors";
import {EmbedBuilder} from "discord.js";
import {getColorInt, ImageHexColors} from "..";

interface BaseProfileProps {
    user: UserDocument;
    colors: ImageHexColors;
}

const BaseProfileEmbed = ({ colors, user }: BaseProfileProps) => {
    return new EmbedBuilder()
        .setColor(getColorInt(colors.Vibrant))
        .setThumbnail(user.avatarUrl)
        .setImage(KnownLinks.EMBED_SPACER);
};

const InformationEmbed = () => {
    return new EmbedBuilder()
        .setColor(Colors.EmbedGray);
};

const ErrorEmbed = () => {
    return new EmbedBuilder()
        .setColor(Colors.Red);
};

const WarningEmbed = () => {
    return new EmbedBuilder()
        .setColor(Colors.Yellow);
};

export { BaseProfileEmbed, ErrorEmbed, InformationEmbed, WarningEmbed };

