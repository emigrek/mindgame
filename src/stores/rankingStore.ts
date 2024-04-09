import {SortingRanges, SortingTypes} from "@/interfaces";
import {Store} from "@/stores";

interface RankingStoreInterface {
    page: number;
    perPage: number;
    pagesCount: number;
    sorting: SortingTypes;
    range: SortingRanges;
    userIds: string[];
    targetUserId?: string;
}

const initial: RankingStoreInterface = {
    page: 1,
    perPage: 9,
    pagesCount: 1,
    sorting: SortingTypes.EXP,
    range: SortingRanges.TOTAL,
    userIds: [],
}

export const rankingStore = new Store<RankingStoreInterface>(initial);