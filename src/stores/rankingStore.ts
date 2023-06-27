import { Store } from ".";

interface RankingStoreInterface {
    page: number;
    sorting: string;
    userIds: string[];
    guildOnly: boolean;
}

const initial: RankingStoreInterface = {
    page: 1,
    sorting: "exp",
    userIds: [],
    guildOnly: false
}

export const rankingStore = new Store<RankingStoreInterface>(initial);