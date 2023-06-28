import { Store } from "@/stores";

interface ProfileStoreInterface {
    targetUserId: string | null;
}

const initial: ProfileStoreInterface = {
    targetUserId: null
}

export const profileStore = new Store<ProfileStoreInterface>(initial);