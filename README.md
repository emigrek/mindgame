[![Mindgame](https://github.com/emigrek/mindgame/blob/main/media/repo-header.png)](https://discord.com/api/oauth2/authorize?client_id=1049355872389832714&permissions=8&scope=applications.commands%20bot)
<center><i>click banner to invite bot to your server!</i></center>

# 🌌 Mindgame
Advanced discord application with **leveling** and **activity tracking** utilities.

## 📦 Used packages
| 📦 Package  | 📋 Reasons |
| ------------- | ------------- |
| Typescript  | type safety  |
| discord.js  | discord bot baseline |
| Mongoose  | storing data  |
| i18n  | internationalization-framework  |
| Dotenv  | environment variables  |
| Nodemon  | development  |
| node-html-to-image  | messages with html & css  |
| Tailwind CSS  | css framework  |
| discord-logs | extended discord events |
| moment | time formatting |

## 🚀 Running
Get running MongoDB instance for storing data
```
git clone https://github.com/emigrek/mindgame
cd mindgame
npm install
```
Set up your .env file with bot token, application id and MongoDB connection string.

Run development server
```
npm run dev
```
or
run production build
```
npm run build
```

## 🚧 TODO

* Experience system
    * Level formula ([desmos](https://www.desmos.com/calculator/fue9fmpfev))
    * Level up notification
    * Daily reward notification
    * Events
        * guildUserLeveledUp(user, guild)
        * guildUserRecievedDailyReward(user, guild)

* User profiles
    * Week activity graph
    * Statistics

* Server statistics notifications
    * Daily activity graph
    * Monthly activity graph

* Games
    * Commands
        * /skin invite @user
        * /skill invite @user
    * List
        * League of Legends skin puzzle
        * League of Legends skill
    * Caching
        * Caching skin/skill images to reduce API calls


* User activity tracking
    * Track user presence
        * Events
            * guildMemberOnline
            * guildMemberOffline
    * Track user voice activity and streaming state
        * Events
            * voiceChannelJoin
            * voiceChannelLeave
            * voiceChannelSwitch
            * voiceChannelDeaf
            * voiceChannelUndeaf
            * voiceStreamingStart
            * voiceStreamingStop
