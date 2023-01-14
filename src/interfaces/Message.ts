export interface Message {
    messageId: string;
    channelId: string;
    targetUserId: string | null;
    name: string | null;
}