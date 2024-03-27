export type VoiceMultiplier = (seconds: number, inVoice: number) => number;
export type PresenceMultiplier = (seconds: number) => number;
export type MessageMultiplier = (files: boolean) => number;

export interface ExperienceConfig {
    constant: number;

    message: {
        enabled: boolean;
        value: number;
        multiplier: MessageMultiplier;
    }

    voice: {
        enabled: boolean;
        value: number;
        multiplier: VoiceMultiplier;

        dailyActivityReward: number;
        significantActivityStreakReward: number;
    }

    presence: {
        enabled: boolean;
        value: number;
        multiplier: PresenceMultiplier;
    }
}