import { Store } from "@/stores";

interface SelectOptionsStoreInterface {
    options: string[]
    results: string[]
}

const initial: SelectOptionsStoreInterface = {
    options: [],
    results: []
}

export const selectOptionsStore = new Store<SelectOptionsStoreInterface>(initial);