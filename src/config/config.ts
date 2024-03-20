import { Config } from "@/interfaces";

export const config: Config = {
    /** 
     * This constant directly affects the scaling between experience points and levels. 
     * A lower experienceConstant means that each level requires more experience points, making the progression slower. 
     * Conversely, a higher experienceConstant would make levels require fewer experience points, accelerating progression.
     */
    experienceConstant: 0.3829,

    // Used to calculate experience gain
    // The final experience is calculated as a random gaussian number between 1 and modificator times multiplier.
    experienceCalculatorConfig: {
        voiceMultiplier: 0.007,
        // inVoice is the number of users in the voice channel the user is in
        // can be used to give a bonus to users in voice channels with more people or the opposite depending on the use case
        voiceModificator: (seconds: number, inVoice: number) => {
            const hours = seconds / 3600;
            const boost = 1 + Math.sqrt(Math.max(hours, 1));
            return boost * (inVoice + 1);
        },

        presenceMultiplier: 0.0007,
        presenceModificator: (seconds: number) => {
            const hours = seconds / 3600;
            return hours < 12 ? 1 : 0.5;
        },
    },

    // Experience reward for daily voice activity
    dailyRewardExperience: 5000,

    // Hours of inactivity before a user is considered to be on a long break. When user join a voice channel after a long break, his followers are notified about it.
    userLongBreakHours: 8,

    // Timeout after which text channel's bots messages are sweeped before the guild is considered as empty
    emptyGuildSweepTimeoutMs: 10_000,

    // List of bot prefixes based on which messages are considered as bot messages and are sweeped when guild voice channels are empty
    // Besides that list, all messages from bot users are considered as bot messages
    emptyGuildSweepBotPrefixesList: ['!', '$', '%', '^', '&', '(', ')', '/'],

    // Whether to automatically put slash commands on client login
    autoPutSlashCommands: true,

    // Experience reward for significant voice activity streak
    // Setting this to 0 will disable the reward
    voiceSignificantActivityStreakReward: 10000,

    // A function that determines whether a streak is significant enough to be notified about
    // The default formula is that a streak is significant if it's 3 or 5 or a multiple of 10
    voiceSignificantActivityStreakFormula: (streak: number, maxStreak: number) => {
        const isSignificant = streak === 3 || streak === 5 || (streak > 0 && streak % 10 === 0);
        const nextSignificant = (() => {
            if (streak < 3) return 3;
            if (streak < 5) return 5;
            if (streak < 10) return 10;
            else return Math.ceil((streak + 1) / 10) * 10;
        })();

        return {
            streak,
            maxStreak,
            isSignificant,
            nextSignificant
        };
    }
}