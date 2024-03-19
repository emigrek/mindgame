import ExtendedClient from "@/client/ExtendedClient";
import { ImageHexColors } from "@/modules/messages";
import { UserDocument } from "@/modules/schemas/User";
import { ProfilePages } from "@/stores/profileStore";
import { MessageCreateOptions } from "discord.js";

export interface ProfilePagePayloadParams {
    client: ExtendedClient;
    sourceUser: UserDocument;
    targetUser: UserDocument;
    renderedUser: UserDocument;
    colors: ImageHexColors;
    selfCall?: boolean;
}

export interface ProfilePagePayloadProps {
    embeds?: MessageCreateOptions["embeds"];
    components?: MessageCreateOptions["components"];
}

export interface ProfilePage {
    emoji: string;
    type: ProfilePages;
    params: ProfilePagePayloadParams;
    getPayload: () => Promise<ProfilePagePayloadProps>;
    visible: boolean;
}