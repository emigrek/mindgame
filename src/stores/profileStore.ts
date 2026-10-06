import { ProfilePages } from "@/interfaces";
import { Store } from "@/stores";

interface ProfileStoreInterface {
    targetUserId?: string;
    page?: ProfilePages;
}

const initial: ProfileStoreInterface = {
    page: ProfilePages.About,
}

export const profileStore = new Store<ProfileStoreInterface>(initial);

// Profile components carry "<customId>:<targetUserId>:<page>" (see ProfilePagesManager), so a click on an older
// message acts on the profile that message shows. Components sent before this change have no suffix and keep the stored state.
export const restoreProfileState = (userId: string, [targetUserId, page]: string[]) => {
    const state = profileStore.get(userId);
    if (targetUserId) state.targetUserId = targetUserId;
    if (page) state.page = page as ProfilePages;
    return state;
}
