[![Mindgame](https://github.com/emigrek/mindgame/blob/main/media/repo-header.png)](https://discord.com/api/oauth2/authorize?client_id=1049355872389832714&permissions=8&scope=applications.commands%20bot)

# Mindgame
discord.js & typescript bot with **leveling** and **activity tracking** utilities.

## 📦 Main technologies
| Package  | Utility |
| ------------- | ------------- |
| typescript  | type safety  |
| discord.js  | discord bot baseline |
| mongoose  | storing data  |
| i18n  | internationalization-framework  |
| dotenv  | environment variables  |
| nodemon  | development  |


## 🚀 Running
```
git clone https://github.com/emigrek/mindgame
cd mindgame
npm install
```
Set up your .env file
```
npm run dev
```

## 🚧 TODO
* Handle user actions
    * User joins server
    * User leaves server
    * Show profile
    * Leaderboard

* Server activity tracking
    * Watching channels (schemas/VoiceActivity.ts)
    * Watching presence (schemas/PresenceActivity.ts)
    * Watching chat (distinct image from text message) (schemas/User.ts)
    * Watching streams (streaming will pay off)

* Custom events
    * Answering event in event message thread.
    * Events
        * Skill (League of Legends)
        * Skin (puzzle) (League of Legends)


