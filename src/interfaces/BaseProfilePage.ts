import { ProfilePage, ProfilePagePayloadParams, ProfilePagePayloadProps } from "@/interfaces";
import { ProfilePages } from "@/stores/profileStore";

export abstract class BaseProfilePage implements ProfilePage {
    type: ProfilePages;
    emoji: string;
    params: ProfilePagePayloadParams;

    constructor(type: ProfilePages, emoji: string, params: ProfilePagePayloadParams) {
        this.type = type;
        this.emoji = emoji;
        this.params = params;
    }

    abstract getPayload(): Promise<ProfilePagePayloadProps>;

    get visible() {
        return true;
    }
}