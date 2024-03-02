import { ExperienceCalculatorConfig } from "@/interfaces";

class ExperienceCalculator {
    private presenceMultiplier: number;
    private voiceMultiplier: number;

    constructor(config: ExperienceCalculatorConfig) {
        this.presenceMultiplier = config.presenceMultiplier;
        this.voiceMultiplier = config.voiceMultiplier;
    }

    public getPresence(seconds: number): number {
        const hours = seconds / 3600;
        const cap = hours < 1 ? 1 : 0.5;
        const maxExp = Math.round(seconds * this.presenceMultiplier * cap);
        return this.getRandomInt(1, maxExp);
    }

    public getVoice(seconds: number, inVoice: number): number {
        const hours = seconds / 3600;
        const boost = hours < 1 ? 1 : hours ** 2;
        const maxExp = Math.round(seconds * this.voiceMultiplier * boost * (inVoice + 1));
        return this.getRandomInt(1, maxExp);
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(this.randomGaussian() * (max - min + 1)) + min;
    }

    private randomGaussian(): number {
        let u = 0,
            v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num / 10.0 + 0.5;
        if (num > 1 || num < 0) return this.randomGaussian();
        return num;
    }
}

export { ExperienceCalculator };