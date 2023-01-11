![Mindgame](https://raw.githubusercontent.com/emigrek/mindgame/main/media/repo-banner.png)

# 🌌 Mindgame [(invite me)](https://discord.com/api/oauth2/authorize?client_id=1049355872389832714&permissions=8&scope=bot%20applications.commands)
Advanced discord application with **leveling** and **activity tracking** utilities.

# ✨ [Experience](https://docs.google.com/spreadsheets/d/1X20H9ZW5LRT_xLXmg1M8WZG3lsxSERbqzfkl7-oYz_8) your discord server in a new way!
<img src="https://cdn.discordapp.com/ephemeral-attachments/442778022693830668/1062581303100330034/image.png" alt="experience" width="200"/>

# 👨‍👩‍👧‍👦 View your community backstage
<img src="https://cdn.discordapp.com/attachments/271045960363278357/1061682368118796399/image.png" alt="backstage" width="200"/>

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
| @octokit/rest | github commits |

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

* Experience based permissions
* Experience based channels

* User profile
    * Profile pages
        * Permissions page
            * Show user permissions
        * Voice and presence activity page
            * Show activity tables
            * Show favorite guilds
    * Follow system
        * When user follows another user, they will receive notifications about their new status in DM
    * Gather presence activities
        * Show profile badges depending on most frequent activities
        * Example badges
            * Gamer (playing)
                * [game name] lover
            * Listener (listening)

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

* API