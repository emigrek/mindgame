import {Message, MessageCreateOptions, TextBasedChannel} from "discord.js";
import {delay} from "@/utils/delay";

interface ExtendedMessageCreateOptions {
    channel: TextBasedChannel;
    payload: MessageCreateOptions;
    callback?: (message: Message) => Promise<void>;
}

type WorkCallback = ((channelId: string) => Promise<void>) | null;

class NotificationsManager {
    private static instance: NotificationsManager;

    private queue: Map<string, ExtendedMessageCreateOptions[]>;

    private workDelay = 750;
    private workStartCallback: WorkCallback = null;
    private workEndCallback: WorkCallback = null;
    private workLastItemInQueueCallback: WorkCallback = null;
    private workLastItemInQueueCallbackCalled = false;

    private constructor() {
        this.queue = new Map();
    }

    public static getInstance(): NotificationsManager {
        if (!NotificationsManager.instance) {
            NotificationsManager.instance = new NotificationsManager();
        }
        return NotificationsManager.instance;
    }

    public setWorkStartCallback(callback: WorkCallback): void {
        this.workStartCallback = callback;
    }

    public setWorkEndCallback(callback: WorkCallback): void {
        this.workEndCallback = callback;
    }

    public setWorkLastItemInQueueCallback(callback: WorkCallback): void {
        this.workLastItemInQueueCallback = callback;
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

        if (this.workStartCallback) {
            await this.workStartCallback(channelId)
                .catch(e => console.log(`Error when calling workStartCallback in NotificationManager: ${e}`));
        }

        while (this.queue.get(channelId)?.length) {
            await delay(this.workDelay);

            if (this.workLastItemInQueueCallback && !this.workLastItemInQueueCallbackCalled && this.isQueueOnLastItem(channelId)) {
                this.workLastItemInQueueCallbackCalled = true;
                await this.workLastItemInQueueCallback(channelId)
                    .catch(e => console.log(`Error when calling workLastItemInQueueCallback in NotificationManager: ${e}`));
            }

            try {
                const options = this.queue.get(channelId)?.shift();
                if (!options) continue;
                const {payload, callback} = options;
                const message = await channel.send(payload);
                if (callback) await callback(message);
            } catch (e) {
                console.log(`Error when sending message in NotificationManager: ${e}`);
            }
        }

        this.workLastItemInQueueCallbackCalled = false;
        if (this.workEndCallback && this.isQueueEmpty(channelId)) {
            await this.workEndCallback(channelId)
                .catch(e => console.log(`Error when calling workEndCallback in NotificationManager: ${e}`));
        }
    }

    private isQueueEmpty(channelId: string): boolean {
        return !this.queue.has(channelId) || this.queue.get(channelId)?.length === 0;
    }

    private isQueueOnLastItem(channelId: string): boolean {
        return this.queue.get(channelId)?.length === 1;
    }
}

export default NotificationsManager;