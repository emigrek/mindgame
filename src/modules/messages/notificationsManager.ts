import {Message, MessageCreateOptions, SendableChannels} from "discord.js";
import {delay} from "@/utils/delay";

interface ExtendedMessageCreateOptions {
    channel: SendableChannels;
    payload: MessageCreateOptions;
    callback?: (message: Message) => Promise<void>;
}

type WorkCallback = ((channelId: string) => Promise<void>) | null;

class NotificationsManager {
    private static instance: NotificationsManager;

    private queue: Map<string, ExtendedMessageCreateOptions[]>;
    // Channels with a running worker. Inferring it from an empty queue let a second worker start
    // while the last message was still being sent.
    private running = new Set<string>();
    private lastItemCallbackCalled = new Set<string>();

    private workDelay = 750;
    private workEndCallback: WorkCallback = null;
    private workLastItemInQueueCallback: WorkCallback = null;

    private constructor() {
        this.queue = new Map();
    }

    public static getInstance(): NotificationsManager {
        if (!NotificationsManager.instance) {
            NotificationsManager.instance = new NotificationsManager();
        }
        return NotificationsManager.instance;
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

        const queue = this.queue.get(channelId) ?? [];
        queue.push(options);
        this.queue.set(channelId, queue);

        if (this.running.has(channelId)) return;
        this.running.add(channelId);
        try {
            await this.work(channel);
        } finally {
            this.running.delete(channelId);
            this.lastItemCallbackCalled.delete(channelId);
            this.queue.delete(channelId);
        }
    }

    private async work(channel: SendableChannels): Promise<void> {
        const channelId = channel.id;

        // Repeats when messages were scheduled while the end callback ran
        do {
            while (this.queue.get(channelId)?.length) {
                await delay(this.workDelay);

                if (this.workLastItemInQueueCallback && !this.lastItemCallbackCalled.has(channelId) && this.isQueueOnLastItem(channelId)) {
                    this.lastItemCallbackCalled.add(channelId);
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

            if (this.workEndCallback) {
                await this.workEndCallback(channelId)
                    .catch(e => console.log(`Error when calling workEndCallback in NotificationManager: ${e}`));
            }
        } while (this.queue.get(channelId)?.length);
    }

    private isQueueOnLastItem(channelId: string): boolean {
        return this.queue.get(channelId)?.length === 1;
    }
}

export default NotificationsManager;
