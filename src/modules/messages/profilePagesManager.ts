import { BaseProfilePage, ProfilePages } from "@/interfaces";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import * as profilePages from './pages/profile';
import { getUserPageSelect } from "./selects";

class ProfilePagesManager {
    params: ProfilePagePayloadParams;
    pages: BaseProfilePage[] = [];

    constructor(params: ProfilePagePayloadParams) {
        this.params = params;
        this.pages = Object
            .values(profilePages)
            .map((Page) => new Page(params));
    }

    getVisiblePages(): BaseProfilePage[] {
        return this.pages
            .filter((page) => page.visible)
            .sort((a, b) => a.position - b.position);
    }

    getPageByType(type: ProfilePages): BaseProfilePage {
        return this.pages.find((page) => page.type === type) || new profilePages.About(this.params);
    }

    async getPagePayloadByType(type: ProfilePages) {
        const page = this.getPageByType(type);
        const payload = await page.getPayload();

        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                await getUserPageSelect(
                    page.name,
                    this
                        .getVisiblePages()
                        .map(({ name, type, emoji }) => ({
                            label: name,
                            emoji: emoji,
                            value: type
                        }))
                )
            );

        payload.components = [...(payload.components || []), selectRow];

        return payload;
    }
}

export default ProfilePagesManager;