import { BaseProfilePage } from "@/interfaces";
import { ProfilePagePayloadParams } from "@/interfaces/ProfilePage";
import { ProfilePages } from "@/stores/profileStore";
import * as profilePages from './pages/profile';

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
        return this.pages.filter((page) => page.visible);
    }

    getPageByType(type: ProfilePages): BaseProfilePage {
        return this.pages.find((page) => page.type === type) || new profilePages.About(this.params);
    }
}

export default ProfilePagesManager;