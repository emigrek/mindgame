export type VoiceModificator = (seconds: number, inVoice: number) => number;
export type PresenceModificator = (seconds: number) => number;

export interface ExperienceCalculatorConfig {
    voiceMultiplier: number;
    voiceModificator: VoiceModificator;

    presenceMultiplier: number;
    presenceModificator: PresenceModificator;
}