import { ExperienceCalculatorConfig } from "@/interfaces";
import { getRandomGaussian } from "@/utils/random";

class ExperienceCalculator {
    private config: ExperienceCalculatorConfig;

    constructor(config: ExperienceCalculatorConfig) {
        this.config = config;
    }
    
    public getVoice(seconds: number, inVoice: number): number {
        const maxExp = Math.round(seconds * this.config.voiceMultiplier * this.config.voiceModificator(seconds, inVoice));
        return this.random(1, maxExp || 1);
    }

    public getPresence(seconds: number): number {
        const maxExp = Math.round(seconds * this.config.presenceMultiplier * this.config.presenceModificator(seconds));
        return this.random(1, maxExp || 1);
    }
    
    private random(min: number, max: number): number {
        return Math.floor(getRandomGaussian() * (max - min + 1)) + min;
    }
}

export { ExperienceCalculator };