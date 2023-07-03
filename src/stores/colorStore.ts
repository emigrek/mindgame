import { Store } from "@/stores";

interface ColorStoreInterface {
    color: string | null;
}

const initial: ColorStoreInterface = {
    color: null
}

export const colorStore = new Store<ColorStoreInterface>(initial);