![Mindgame](https://raw.githubusercontent.com/emigrek/mindgame/main/media/repo-banner.png)

# 🌌 Mindgame [(invite)](https://discord.com/api/oauth2/authorize?client_id=1049355872389832714&permissions=8&scope=bot%20applications.commands)
Advanced discord application with **leveling** and **activity tracking** utilities.

## 👀 Preview
![Feature preview](https://i.imgur.com/VTAoGN6.png)

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

Set up your .env file with bot token, application id and MongoDB connection string. You can find example in .env.example file.

``` .env
DISCORD_TOKEN="Discord bot token"
DISCORD_CLIENT_ID="Discord application client ID"
MONGO_URI="MongoDB connection string (with collection name at the end)"
DAILY_REWARD="Amount of experience for daily reward"
OWNER_ID="Your Discord ID"
```

Run development server

``` bash
npm run dev
```
or start application

``` bash
npm run start
```