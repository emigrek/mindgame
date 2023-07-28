import { Store } from "@/stores";

interface SelectOptionsStoreInterface {
    options: string[],
    reroll: number
}

const initial: SelectOptionsStoreInterface = {
    options: [],
    reroll: 0
}

export const selectOptionsStore = new Store<SelectOptionsStoreInterface>(initial);