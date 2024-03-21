import ExtendedClient from "@/client/ExtendedClient";
import { ImageHexColors } from "@/modules/messages";
import { UserDocument } from "@/modules/schemas/User";
import { Guild, MessageCreateOptions } from "discord.js";

export enum ProfilePages {
    About = "about",
    Statistics = "statistics",
    TimeStatistics = "timeStatistics",
    PresenceActivity = "presenceActivity",
    VoiceActivity = "voiceActivity",
    GuildVoiceActivityStreak = "guildVoiceActivityStreak",
}

export interface ProfilePagePayloadParams {
    client: ExtendedClient;
    sourceUser: UserDocument;
    targetUser: UserDocument;
    renderedUser: UserDocument;
    colors: ImageHexColors;
    guild?: Guild;
    selfCall?: boolean;
}

export interface ProfilePagePayloadProps {
    embeds?: MessageCreateOptions["embeds"];
    components?: MessageCreateOptions["components"];
}

export interface ProfilePage {
    emoji: string;
    type: ProfilePages;
    position: number;
    params: ProfilePagePayloadParams;
    init?: () => Promise<void>;
    getPayload: () => Promise<ProfilePagePayloadProps>;
    visible: boolean;
}