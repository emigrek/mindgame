<p align="center">
    <img alt="Mindgame logo" style="height: 150px;width: 150px;" src="https://raw.githubusercontent.com/emigrek/mindgame/main/media/logo.png" />
</p>

# 🌌 Mindgame
**Mindgame** provides a way to track user's activity in guild and reward them for being active. If you're looking for a way to engage your community or see the most active users in your guild, this Discord application is for you.

## 📚 Features Overview
### 1. **Experience Enhancement Tools** 
Configurable experience system that rewards users for being active in various ways.

* **Profiles** -  Access profiles to view detailed activity insights for yourself or other users.
* **Guild Ranking** - Discover the most active members with a ranking system armed with wide range of sorting options.
* **Level roles** - Receive roles that reflect your engagement level within the guild. These roles are automatically updated and can be customized.
* **Color role** - Unlock ability to create a custom role with a color of your choice.
* **Extra rewards**
    * **Daily** - Earn rewards for participating in voice channels daily.
    * **Streak** - Accumulate rewards by maintaining a consecutive daily voice activity streak.

### 2. **Utility Features**
Enhance your Discord experience with tools designed from user to user.

* **Automatic text channel sweeping** - Keep your text channels clean by automatically removing bot related messages when voice channels are vacant.
* **Ephemeral channels** - Tired of your text channels being cluttered with unimportant messages? Create an ephemeral channel that automatically deletes all messages after a set period of time. Messages with reactions can be preserved.
* **User follow** - Stay connected by receiving notifications when friends join a voice channel (available only in guilds with the bot).
* **Select** - Indecisive about game choices? Let the Select command randomly make the choice for you, powered by Math.random().

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

## 📋 Requirements 

1. Node.js 18.16.0 or newer
2. MongoDB 5.0.0 or newer
<details>
<summary>3. Discord installation settings</summary>

![Discord installation settings](https://raw.githubusercontent.com/emigrek/mindgame/main/media/installation-settings.png)

</details>


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
DISCORD_TOKEN=Discord bot token
DISCORD_CLIENT_ID=Discord application client ID
MONGO_URI=MongoDB connection string (IMPORTANT: put root collection name at the end of the connection string)
OWNER_ID=Your Discord ID
```
</details>

Change application config file to your needs (can be found in ```src/config/config.ts```)
<details>
<summary>Default config</summary>

``` typescript
import {ActivityStreak, Config} from "@/interfaces";

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

    // Hours of inactivity before a user is considered to be on a long break. When user join a voice channel after a long break, his followers are notified about it.
    userLongBreakHours: 8,

    // Timeout after which text channel's bots messages are swept before the guild is considered as empty
    emptyGuildSweepTimeoutMs: 10_000,

    // List of bot prefixes based on which messages are considered as bot messages and are swept when guild voice channels are empty
    // Besides that list, all messages from bot users are considered as bot messages
    emptyGuildSweepBotPrefixesList: ['!', '$', '%', '^', '&', '(', ')', '/'],

    // Whether to automatically put slash commands on client login
    autoPutSlashCommands: true,

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
```
</details>

### Docker

Build Docker image

``` bash
docker build -t mindgame .
```

* Run Docker container

``` bash
docker run --env-file .env --rm mindgame
```

Hosting MongoDB in other container?

Replace `[container_name]` with your MongoDB container name

Replace `[alias]` with your MongoDB container alias

``` bash
docker run --env-file .env --link [container_name]:[alias] --rm mindgame
```

Your `MONGO_URI` should look like this:

``` .env
MONGO_URI=mongodb://[alias]:[your_port]/[collection_name]
```

### Local

Start application

``` bash
npm run start
```