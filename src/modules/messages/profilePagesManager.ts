import { BaseProfilePage, ProfilePages } from "@/interfaces";
import { ProfilePagePayloadParams, ProfilePagePayloadProps } from "@/interfaces/ProfilePage";
import { ActionRowBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js";
import * as profilePages from './pages/profile';
import { getProfileUserSelect, getUserPageSelect } from "./selects";

class ProfilePagesManager {
    params: ProfilePagePayloadParams;
    pages: BaseProfilePage[] = [];

    constructor(params: ProfilePagePayloadParams) {
        this.params = params;
        this.pages = this.renderPages(params);
    }

    renderPages(params: ProfilePagePayloadParams): BaseProfilePage[] {
        this.params = params;
        return Object
            .values(profilePages)
            .map((Page) => new Page(params));
    }

    async init() {
        await Promise.all(this.pages.map((page) => page.init()));
        return this;
    }

    async getVisiblePages(): Promise<BaseProfilePage[]> {
        return this.pages
            .filter((page) => page.visible)
            .sort((a, b) => a.position - b.position);
    }

    getPageByType(type: ProfilePages): BaseProfilePage {
        return this.pages.find((page) => page.type === type) || new profilePages.About(this.params);
    }

    async getPagePayloadByType(type: ProfilePages) {
        const page = this.getPageByType(type);
        let payload = await page.getPayload();
        payload = this.attachUserSelectRow(type, payload);
        payload = await this.attachPageSelectRow(type, payload);
        return payload;
    }

    async attachPageSelectRow(type: ProfilePages, payload: ProfilePagePayloadProps) {
        const page = this.getPageByType(type);
        const pages = await this.getVisiblePages();
        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                await getUserPageSelect(
                    page.description ? page.description : page.name,
                    pages.map(({ name, type, emoji, description }) => ({
                        label: name,
                        emoji: emoji,
                        value: type,
                        description: description,
                        default: type === page.type,
                    }))
                )
            );
        payload.components = [...(payload.components || []), selectRow];
        return payload;
    }

    attachUserSelectRow(type: ProfilePages, payload: ProfilePagePayloadProps) {
        const selectRow = new ActionRowBuilder<UserSelectMenuBuilder>()
            .addComponents(
                getProfileUserSelect(
                    this.params.renderedUser
                )
            );
        payload.components = [...(payload.components || []), selectRow];
        return payload;
    }
}

export default ProfilePagesManager;