import { ProfilePage, ProfilePagePayloadParams, ProfilePagePayloadProps, ProfilePages } from "@/interfaces";

export interface BaseProfilPageProps {
    type: ProfilePages;
    name: string;
    emoji: string;
    params: ProfilePagePayloadParams;
    position: number;
}

export abstract class BaseProfilePage implements ProfilePage {
    type: ProfilePages;
    name: string;
    emoji: string;
    params: ProfilePagePayloadParams;
    position: number;

    constructor(props : BaseProfilPageProps) {
        this.type = props.type;
        this.name = props.name;
        this.emoji = props.emoji;
        this.params = props.params;
        this.position = props.position;
    }

    abstract getPayload(): Promise<ProfilePagePayloadProps>;

    get visible() {
        return true;
    }
}