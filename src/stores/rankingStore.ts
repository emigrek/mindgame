import { Store } from "@/stores";

interface RankingStoreInterface {
    page: number;
    perPage: number;
    pagesCount: number;
    sorting: string;
    userIds: string[];
    guildOnly: boolean;
}

const initial: RankingStoreInterface = {
    page: 1,
    perPage: 9,
    pagesCount: 1,
    sorting: "day exp",
    userIds: [],
    guildOnly: false
}

export const rankingStore = new Store<RankingStoreInterface>(initial);