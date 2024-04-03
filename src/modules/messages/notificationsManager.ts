import {Message, MessageCreateOptions, TextBasedChannel} from "discord.js";
import {delay} from "@/utils/delay";

interface ExtendedMessageCreateOptions {
    channel: TextBasedChannel;
    payload: MessageCreateOptions;
    callback?: (message: Message) => Promise<void>;
}

class NotificationsManager {
    private static instance: NotificationsManager;

    private queue: Map<string, ExtendedMessageCreateOptions[]>;

    private workDelay = 750;
    private workEndCallback: ((channelId: string) => void) | null = null;

    private constructor() {
        this.queue = new Map();
    }

    public static getInstance(): NotificationsManager {
        if (!NotificationsManager.instance) {
            NotificationsManager.instance = new NotificationsManager();
        }
        return NotificationsManager.instance;
    }

    public setWorkEndCallback(callback: (channelId: string) => void): void {
        this.workEndCallback = callback;
    }

    public async schedule(options: ExtendedMessageCreateOptions): Promise<void> {
        const {channel} = options;
        const channelId = channel.id;

        if (!this.queue.has(channelId))
            this.queue.set(channelId, []);

        const isQueueEmpty = this.isQueueEmpty(channelId);
        this.queue.get(channelId)?.push(options);

        if (isQueueEmpty) {
            await this.work(channel);
        }
    }

    private async work(channel: TextBasedChannel): Promise<void> {
        const channelId = channel.id;

        while (this.queue.get(channelId)?.length) {
            await delay(this.workDelay);
            try {
                const options = this.queue.get(channelId)?.shift();
                if (!options) continue;
                const {payload, callback} = options;
                const message = await channel.send(payload);
                if (callback) await callback(message);
            } catch (e) {
                console.log(`Error when sending message in MessageManager: ${e}`);
            }
        }

        if (this.workEndCallback && this.isQueueEmpty(channelId)) {
            this.workEndCallback(channelId);
        }
    }

    private isQueueEmpty(channelId: string): boolean {
        return !this.queue.has(channelId) || this.queue.get(channelId)?.length === 0;
    }
}

export default NotificationsManager;