import i18n from "@/client/i18n";
import { ErrorEmbed } from "@/modules/messages/embeds";

const getErrorMessagePayload = () => {
    const embed = ErrorEmbed()
        .setTitle(i18n.__("error.title"))
        .setDescription(i18n.__("error.description"));

    // No flags: the payload is also used with editReply, where Discord rejects SuppressNotifications
    return {
        embeds: [embed],
    };
}

export { getErrorMessagePayload };
