import { Collection, Message } from "discord.js";

class EphemeralChannelMessageCache {
    private _cache: Collection<string, Message[]> = new Collection();

    public add(channelId: string, message: Message) {
        const messages = this._cache.get(channelId) ?? [];

        if (this.get(channelId, message.id)) return;

        messages.push(message);
        this._cache.set(channelId, messages);
    }

    public remove(channelId: string, messageId: string) {
        const messages = this._cache.get(channelId) ?? [];
        const index = messages.findIndex(message => message.id === messageId);
        if (index !== -1)
            messages.splice(index, 1);

        if (!messages.length)
            this.removeChannel(channelId);
        else
            this._cache.set(channelId, messages);
    }

    public removeChannel(channelId: string) {
        this._cache.delete(channelId);
    }

    public get(channelId: string, messageId: string) {
        const messages = this._cache.get(channelId) ?? [];
        return messages.find(message => message.id === messageId);
    }

    public getCache() {
        return this._cache;
    }
}

export const ephemeralChannelMessageCache = new EphemeralChannelMessageCache();