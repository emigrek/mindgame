import { Store } from "@/stores";

interface AchievementsStoreInterface {
    display: string[];
    page: number;
    pages: number;
    perPage: number;
}

const initial: AchievementsStoreInterface = {
    display: ['unlocked'],
    page: 1,
    pages: 1,
    perPage: 3
}

export const achievementsStore = new Store<AchievementsStoreInterface>(initial);