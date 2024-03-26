import {ExperienceCalculatorConfig} from "@/interfaces";
import {getRandomGaussian} from "@/utils/random";

class ExperienceCalculator {
    private config: ExperienceCalculatorConfig;

    constructor(config: ExperienceCalculatorConfig) {
        this.config = config;
    }
    
    public getVoiceReward(seconds: number, inVoice: number): number {
        const maxExp = Math.round(seconds * this.config.voiceMultiplier * this.config.voiceModificator(seconds, inVoice));
        return this.random(1, maxExp || 1);
    }

    public getPresenceReward(seconds: number): number {
        const maxExp = Math.round(seconds * this.config.presenceMultiplier * this.config.presenceModificator(seconds));
        return this.random(1, maxExp || 1);
    }

    public getMessageReward(files: boolean): number {
        const maxExp = this.config.messageExperience * this.config.messageModificator(files);
        return this.random(1, maxExp);
    }
    
    private random(min: number, max: number): number {
        return Math.floor(getRandomGaussian() * (max - min + 1)) + min;
    }
}

export { ExperienceCalculator };