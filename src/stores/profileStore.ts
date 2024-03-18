import { Store } from "@/stores";

export enum ProfilePages {
    About = "about",
    Statistics = "statistics",
    TimeSpent = "timeSpent",
    PresenceActivity = "presenceActivity",
    VoiceActivity = "voiceActivity",
}

interface ProfileStoreInterface {
    targetUserId?: string;
    page?: ProfilePages;
}

const initial: ProfileStoreInterface = {
    page: ProfilePages.About,
}

export const profileStore = new Store<ProfileStoreInterface>(initial);