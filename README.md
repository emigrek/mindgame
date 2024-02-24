![Mindgame](https://raw.githubusercontent.com/emigrek/mindgame/main/media/repo-banner.png)

# 🌌 Mindgame
Advanced discord application with **leveling** and **activity tracking** utilities.

## 🌍 Locales
This application is fully translated (including slash commands, context menus, etc.) in:
- English (en-US)
- Polish (pl)

## 📦 Used packages
| 📦 Package  | 📋 Reasons |
| ------------- | ------------- |
| Typescript  | type safety  |
| discord.js  | discord bot baseline |
| Mongoose  | storing data  |
| i18n  | internationalization-framework  |
| Dotenv  | environment variables  |
| Nodemon  | development  |
| discord-logs | extended discord events |
| moment | time formatting |
| node-vibrant | cool looking embed colors |
| node-cron | scheduling |
| @octokit/rest | github commits |

## 🚀 Running
Get running MongoDB instance for storing data. Make sure you create collection, name it whatever you want and put it at the end of your MongoDB connection string. You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for free MongoDB instance. 

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
MONGO_URI="MongoDB connection string (with collection name at the end)"
OWNER_ID="Your Discord ID"
```
</details>

Change application config file to your needs (can be found in ```src/config/config.ts```)
<details>
<summary>Default config</summary>

``` typescript
import { Config } from "@/interfaces";

export const config: Config = {
    /** 
     * This constant directly affects the scaling between experience points and levels. 
     * A lower experienceConstant means that each level requires more experience points, making the progression slower. 
     * Conversely, a higher experienceConstant would make levels require fewer experience points, accelerating progression.
     */
    experienceConstant: 0.3829,

    // Used to calculate experience gain, those values are per second of activity
    experienceCalculatorConfig: {
        presenceMultiplier: 0.0002,
        voiceMultiplier: 0.0007
    },

    // Experience reward for daily voice activity
    dailyRewardExperience: 5000,

    // Hours of inactivity before a user is considered to be on a long break
    userLongBreakHours: 8,

    // Timeout after which text channel's bots messages are sweeped
    emptyGuildSweepTimeoutMs: 10_000,

    // List of bot prefixes based on which messages are considered as bot messages and are sweeped when guild voice channels are empty
    // Besides that list, all messages from bot users are considered as bot messages
    emptyGuildSweepBotPrefixesList: ['!', '#', '$', '%', '^', '&', '*', '(', ')', '/'],
}
```
</details>

Run development server

``` bash
npm run dev
```
or start application

``` bash
npm run start
```