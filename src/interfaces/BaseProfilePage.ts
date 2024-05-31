import { ProfilePage, ProfilePagePayloadParams, ProfilePagePayloadProps, ProfilePages } from "@/interfaces";
import { bold } from "discord.js";

export interface BaseProfilePageProps {
    type: ProfilePages;
    name: string;
    description?: string;
    emoji: string;
    params: ProfilePagePayloadParams;
}

export abstract class BaseProfilePage implements ProfilePage {
    type: ProfilePages;
    name: string;
    description?: string;
    emoji: string;
    params: ProfilePagePayloadParams;

    protected constructor(props : BaseProfilePageProps) {
        this.type = props.type;
        this.name = props.name;
        this.description = props.description;
        this.emoji = props.emoji;
        this.params = props.params;
    }

    abstract getPayload(): Promise<ProfilePagePayloadProps>;
    
    init(): Promise<void> {
        return Promise.resolve();
    }

    get visible() {
        return true;
    }

    get embedTitleField() {
        return {
            name: bold(`${this.emoji}   ${this.name}`),
            value: bold(` `),
            inline: false,
        }
    }
}