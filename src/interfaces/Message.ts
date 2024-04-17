export interface Message {
    messageId: string;
    channelId: string;
    typeId: MessageTypeIds;
    targetUserId?: string;
}

export enum MessageTypeIds {
    LEVEL_UP,
    DAILY_REWARD,
    SIGNIFICANT_VOICE_ACTIVITY_STREAK,
    INVITE_NOTIFICATION,
}