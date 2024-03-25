import { ProfilePage, ProfilePagePayloadParams, ProfilePagePayloadProps, ProfilePages } from "@/interfaces";

export interface BaseProfilPageProps {
    type: ProfilePages;
    name: string;
    description?: string;
    emoji: string;
    params: ProfilePagePayloadParams;
    position: number;
}

export abstract class BaseProfilePage implements ProfilePage {
    type: ProfilePages;
    name: string;
    description?: string;
    emoji: string;
    params: ProfilePagePayloadParams;
    position: number;

    constructor(props : BaseProfilPageProps) {
        this.type = props.type;
        this.name = props.name;
        this.description = props.description;
        this.emoji = props.emoji;
        this.params = props.params;
        this.position = props.position;
    }

    init(): Promise<void> {
        return Promise.resolve();
    }

    abstract getPayload(): Promise<ProfilePagePayloadProps>;

    get visible() {
        return true;
    }

    get embedTitleField() {
        return {
            name: `**${this.emoji}   ${this.name}**`,
            value: `** **`,
            inline: false,
        }
    }
}