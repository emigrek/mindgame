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