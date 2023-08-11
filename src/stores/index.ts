import { Collection } from "discord.js";
import { cloneDeep } from "lodash";

export class Store<StoreType> {
    private store: Collection<string, StoreType>;
    public initial: StoreType;

    constructor(initial: StoreType) {
        this.store = new Collection<string, StoreType>();
        
        this.initial = initial;
    }

    public init(key: string): this {
        this.store.set(key, cloneDeep(this.initial));
        return this;
    }

    public set(key: string, value: StoreType): this {
        this.store.set(key, value);
        return this;
    }

    public get(key: string): StoreType {
        const value = this.store.get(key);

        if (!value) {
            const copy = cloneDeep(this.initial);
            this.store.set(key, copy);
            return copy;
        }

        return value;
    }

    public has(key: string): boolean {
        return this.store.has(key);
    }

    public delete(key: string): boolean {
        return this.store.delete(key);
    }

    public clear(): void {
        this.store.clear();
    }

    public get size(): number {
        return this.store.size;
    }
}