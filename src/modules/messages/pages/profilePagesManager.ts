import { BaseProfilePage, ProfilePages } from "@/interfaces";
import { ProfilePagePayloadParams, ProfilePagePayloadProps } from "@/interfaces/ProfilePage";
import { ActionRowBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder } from "discord.js";
import { getProfileUserSelect, getUserPageSelect } from "../selects";
import { About, Achievements, GuildVoiceActivityStreak, PresenceActivity, Statistics, TimeStatistics, VoiceActivity } from './profile';

class ProfilePagesManager {
    params: ProfilePagePayloadParams;
    pages: BaseProfilePage[];

    constructor(params: ProfilePagePayloadParams) {
        this.params = params;
        this.pages = [
            new About(params),
            new TimeStatistics(params),
            new Statistics(params),
            new Achievements(params),
            new VoiceActivity(params),
            new GuildVoiceActivityStreak(params),
            new PresenceActivity(params),
        ];
    }

    async init() {
        await Promise.all(this.pages.map((page) => page.init()));
        return this;
    }

    async getVisiblePages(): Promise<BaseProfilePage[]> {
        return this.pages
            .filter((page) => page.visible);
    }

    // A page select on an older message can ask for a page that is private for the user rendered now
    getPageByType(type: ProfilePages): BaseProfilePage {
        return this.pages.find((page) => page.type === type && page.visible) || new About(this.params);
    }

    async getPagePayloadByType(type: ProfilePages) {
        const page = this.getPageByType(type);
        let payload = await page.getPayload();
        payload = this.attachUserSelectRow(type, payload);
        payload = await this.attachPageSelectRow(type, payload);
        return this.attachProfileState(page.type, payload);
    }

    // Suffixes every component with the profile it belongs to, read back by restoreProfileState
    attachProfileState(type: ProfilePages, payload: ProfilePagePayloadProps) {
        for (const row of payload.components ?? []) {
            if (!("components" in row)) continue;
            for (const component of row.components as { data?: { custom_id?: string } }[]) {
                if (component.data?.custom_id)
                    component.data.custom_id = `${component.data.custom_id}:${this.params.targetUser.userId}:${type}`;
            }
        }
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