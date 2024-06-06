import { Store } from "@/stores";

interface AchievementsStoreInterface {
    display: string[];
    page: number;
    pagesCount: number;
}

const initial: AchievementsStoreInterface = {
    display: ['unlocked'],
    page: 1,
    pagesCount: 1,
}

export const achievementsStore = new Store<AchievementsStoreInterface>(initial);