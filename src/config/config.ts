import {Config, VoiceActivityStreak} from "@/interfaces";

export const config: Config = {
    // Whether to enable experience reward for voice activity
    enableVoiceExperienceReward: true,

    // Whether to enable experience reward for presence activity
    enablePresenceExperienceReward: true,

    // Whether to enable experience reward for message activity
    enableMessageExperienceReward: true,

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

        // Experience reward for message activity
        messageExperience: 150,
        // Used to calculate experience gain for messages
        messageModificator: (files: boolean) => {
            return files ? 2 : 1;
        }
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
    voiceActivityStreakLogic: ({ streak, maxStreak }): VoiceActivityStreak => {
        if (!streak || !maxStreak) {
            return {
                streak: undefined,
                maxStreak: undefined,
                isSignificant: false,
                nextSignificant: 0,
            }
        }
        
        const { value: c } = streak;

        const isSignificant = c === 3 || c === 5 || (c > 0 && c % 10 === 0);
        const nextSignificant = (() => {
            if (c < 3) return 3;
            if (c < 5) return 5;
            if (c < 10) return 10;
            else return Math.ceil((c + 1) / 10) * 10;
        })();

        return {
            streak,
            maxStreak: maxStreak,
            isSignificant,
            nextSignificant,
        }
    }
}