![Mindgame](https://raw.githubusercontent.com/emigrek/mindgame/main/media/repo-banner.png)

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
| node-vibrant | cool looking embed colors |
| canvas | image processing |
| node-cron | scheduling |

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
    * Level formula ([spreadsheet](https://docs.google.com/spreadsheets/d/1X20H9ZW5LRT_xLXmg1M8WZG3lsxSERbqzfkl7-oYz_8/edit#gid=0)) ✅
    * Experience based roles ✅
    * Experience based permissions
    * Experience based channels

* Notifications
    * Sweeper
        * When
            * When there is no active voice channel
            * On demand by user using message context
        * Bot remove uneccessary messages from voice text channel

* User profile
    * Show/hide time spent ✅
    * Most frequent guild based on time spent ✅
    * Circular progress bar around avatar
    * Follow system
        * When user follows another user, they will receive notifications about their new status in DM

* Games
    * Invitable and automatic using cron
    * Commands
        * /skin invite @user
        * /skill invite @user
    * List
        * League of Legends skin puzzle
        * League of Legends skill
    * Ranking
        * Collect answer speed and create ranking
    * Caching
        * Caching skin/skill images to reduce API calls
