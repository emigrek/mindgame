import {getRandomGaussian} from "@/utils/random";
import {config} from "@/config";

const { experience } = config;
const { voice, presence, message } = experience;

class ExperienceCalculator {
    public static getVoiceReward(seconds: number, inVoice: number): number {
        const maxExp = Math.round(seconds * voice.value * voice.multiplier(seconds, inVoice));
        return this.random(1, maxExp || 1);
    }

    public static getPresenceReward(seconds: number): number {
        const maxExp = Math.round(seconds * presence.value * presence.multiplier(seconds));
        return this.random(1, maxExp || 1);
    }

    public static getMessageReward(files: boolean): number {
        const maxExp = message.value * message.multiplier(files);
        return this.random(1, maxExp || 1);
    }

    public static random(min: number, max: number): number {
        return Math.floor(getRandomGaussian() * (max - min + 1)) + min;
    }
}

export { ExperienceCalculator };