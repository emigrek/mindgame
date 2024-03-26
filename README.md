<p align="center">
    <img alt="Mindgame logo" style="height: 150px;width: 150px;" src="https://raw.githubusercontent.com/emigrek/mindgame/main/media/logo.png" />
</p>

# 🌌 Mindgame
**Mindgame** provides a way to track user's activity in guild and reward them for being active. If you're looking for a way to engage your community or see the most active users in your guild, this Discord application is for you.

## 📚 Features
1. **Experience** - Configurable experience system that rewards users for being active in various ways.
    * **Profiles** - View your own or other user's profiles with detailed information about their activity.
    * **Ranking** - Check out the guild ranking to see who's the most active in the community depending on your sorting preference.
    * **Level roles** - Roles indicating user's level in the guild. Automatically assigned based on user's level. Can be hoisted or renamed.
    * **Color role** - Custom role unlocked at a certain level enabling you to set your own nickname color in the guild.
    * **Extra Rewards**
        * **Daily** - Get a reward for daily voice activity.
        * **Streak** - Get a reward for voice activity streak.
2. **Utility** - Various utilities to make your Discord experience more enjoyable.
    * **Automatic text channel sweeping** - Automatically sweep bot messages from text channels when voice channels are empty.
    * **Ephemeral channels** - Tired of your text channels being cluttered with unimportant messages? Create an ephemeral channel that will automatically delete all messages after a configurable time. Messages with reactions are preserved.
    * **User follow** - Follow your friends to get notified when they join voice channel. (note: works only on guilds where bot is present)
    * **Select** - Have u ever hesitated to choose between games to play? Use the select command to let the Math.random() decide for you.

## 🌍 Locales
This application is fully translated (including slash commands, context menus, etc.) in:
- English (en-US)
- Polish (pl)

## 📦 Used packages
| 📦 Package    | 📋 Reasons                     |
|---------------|--------------------------------|
| Typescript    | type safety                    |
| discord.js    | discord bot baseline           |
| Mongoose      | storing data                   |
| i18n          | internationalization-framework |
| Dotenv        | environment variables          |
| Nodemon       | development                    |
| discord-logs  | extended discord events        |
| moment        | time formatting                |
| node-vibrant  | cool looking embed colors      |
| node-cron     | scheduling                     |
| @octokit/rest | github commits                 |

## 🚀 Running
Get running MongoDB instance for storing data. Make sure you create collection, name it whatever you want and put it at the end of your MongoDB connection string. You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for free MongoDB instance. 

Create root collection for application data (e.g. `mindgame`).

Clone repository and install dependencies
``` bash
git clone https://github.com/emigrek/mindgame
cd mindgame
npm install
```

Set up your .env file
<details>
<summary>Example .env file</summary>

``` .env
DISCORD_TOKEN="Discord bot token"
DISCORD_CLIENT_ID="Discord application client ID"
MONGO_URI="MongoDB connection string (IMPORTANT: put root collection name at the end of the connection string)"
OWNER_ID="Your Discord ID"
```
</details>

Change application config file to your needs (can be found in ```src/config/config.ts```)
<details>
<summary>Default config</summary>

``` typescript
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
```
</details>

Start application

``` bash
npm run start
```