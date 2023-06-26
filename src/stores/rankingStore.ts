import { Store } from ".";

interface RankingStoreInterface {
    page: number;
    sorting: string;
    guildOnly: boolean;
}

const initial: RankingStoreInterface = {
    page: 1,
    sorting: "exp",
    guildOnly: false
}

export const rankingStore = new Store<RankingStoreInterface>(initial);