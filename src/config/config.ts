import { ActivityStreak, Config } from "@/interfaces";

export const config: Config = {
    // Experience configuration
    experience: {
        constant: 0.3829,
        message: {
            enabled: true,
            value: 150,
            multiplier: (files: boolean) => files ? 2 : 1,
        },
        voice: {
            enabled: true,
            value: 0.007,
            multiplier: (seconds: number, inVoice: number) => {
                const hours = seconds / 3600;
                const boost = 1 + Math.sqrt(Math.max(hours, 1));
                return boost * (inVoice + 1);
            },

            dailyActivityReward: 5000,
            significantActivityStreakReward: 10000,
        },
        presence: {
            enabled: true,
            value: 0.0007,
            multiplier: (seconds: number) => {
                const hours = seconds / 3600;
                return hours < 12 ? 1 : 0.5;
            },
        },
    },
    
    // Achievements configuration
    achievements: {
        enabled: false,
    },

    // Hours of inactivity before a user is considered to be on a long break. When user join a voice channel after a long break, his followers are notified about it.
    userLongBreakHours: 8,

    // Timeout after which text channel's bots messages are swept before the guild is considered as empty
    emptyGuildSweepTimeoutMs: 10_000,

    // List of bot prefixes based on which messages are considered as bot messages and are swept when guild voice channels are empty
    // Besides that list, all messages from bot users are considered as bot messages
    emptyGuildSweepBotPrefixesList: ['!', '$', '%', '^', '&', '(', ')', '/'],

    // Whether to automatically put slash commands on client login
    autoPutSlashCommands: true,

    // Configuration for invite notifications
    inviteNotification: {
        enabled: true,
        // Chance for guild invite notifications to be scheduled after notifications work start
        chance: 15,
    },

    // A function that determines whether a streak is significant enough to be notified about
    // The default formula is that a streak is significant if it's 3 or 5 or a multiple of 10
    voiceActivityStreakLogic: ({ streak, maxStreak }): ActivityStreak => {
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