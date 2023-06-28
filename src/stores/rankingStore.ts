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
    perPage: 6,
    pagesCount: 1,
    sorting: "exp",
    userIds: [],
    guildOnly: false
}

export const rankingStore = new Store<RankingStoreInterface>(initial);