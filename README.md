<p align="center">
    <img alt="Mindgame logo" style="height: 150px;width: 150px;" src="https://raw.githubusercontent.com/emigrek/mindgame/main/media/logo.png" />
</p>

# 🌌 Mindgame

**Mindgame** provides a way to track user's activity in guild and reward them for being active. If you're looking for a way to engage your community or see the most active users in your guild, this Discord application is for you.

## 📚 Features Overview

### 1. **Experience Enhancement Tools**

Configurable experience system that rewards users for being active in various ways.

- **Profiles** - Access profiles to view detailed activity insights for yourself or other users.
- **Guild Ranking** - Discover the most active members with a ranking system armed with wide range of sorting options.
- **Level roles** - Receive roles that reflect your engagement level within the guild. These roles are automatically updated and can be customized.
- **Color role** - Unlock ability to create a custom role with a color of your choice.
- **Extra rewards**
  - **Daily** - Earn rewards for participating in voice channels daily.
  - **Streak** - Accumulate rewards by maintaining a consecutive daily voice activity streak.

### 2. **Achievements**

Unlock guild achievements by completing various tasks and challenges.

<details>

<summary>List of achievements</summary>

| Name               | Deciding factor                                                      |
| ------------------ | -------------------------------------------------------------------- |
| Unique Reactions   | Most users reacting to a single message of yours.                    |
| Coordinated Action | Time between you joining voice channel and someone else joining you. |
| Suss               | Total time spent alone in voice channel.                             |
| Streamer           | Total time spent streaming to others.                                |
| Ghost              | Join voice channel with `Invisible` status.                          |
| DJ                 | Number of messages sent to play music.                               |
| Night Owl          | Total time spent in voice channel between midnight and 5 AM.         |
| Marathon           | Longest single voice channel session.                                |
| Social Butterfly   | Number of different people met in voice channels.                    |
| Host               | Days on which you were the first to join a voice channel.            |
| Comeback           | Length of the break before coming back to voice channels.            |
| Regular            | Time since joining the server.                                       |

</details>

### 3. **Utility Features**

Enhance your Discord experience with tools designed from user to user.

- **Automatic text channel sweeping** - Keep your text channels clean by automatically removing bot related messages when voice channels are vacant.
- **Ephemeral channels** - Tired of your text channels being cluttered with unimportant messages? Create an ephemeral channel that automatically deletes all messages after a set period of time. Messages with reactions can be preserved.
- **User follow** - Stay connected by receiving notifications when friends join a voice channel (available only in guilds with the bot).
- **Select** - Indecisive about game choices? Let the Select command randomly make the choice for you, powered by Math.random().

## 🌍 Locales

This application is translated (including slash commands and context menus) in:

- English (en-US)
- Polish (pl)

## 📦 Used packages

| 📦 Package    | 📋 Reasons                     |
| ------------- | ------------------------------ |
| Typescript    | type safety                    |
| discord.js    | discord bot baseline           |
| Mongoose      | storing data                   |
| i18n          | internationalization-framework |
| Dotenv        | environment variables          |
| tsx           | running TypeScript             |
| discord-logs  | extended discord events        |
| moment        | time formatting                |
| node-vibrant  | cool looking embed colors      |
| node-cron     | scheduling                     |
| @octokit/rest | github commits                 |

## 📋 Requirements

1. Node.js 22 or newer
2. MongoDB 5.0.0 or newer
<details>
<summary>3. Discord installation settings</summary>

![Discord installation settings](https://raw.githubusercontent.com/emigrek/mindgame/main/media/installation-settings.png)

</details>

## 🚀 Running

Get running MongoDB instance for storing data. Pick a database name and put it at the end of your MongoDB connection string. You can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for free MongoDB instance.

Clone repository and install dependencies

```bash
git clone https://github.com/emigrek/mindgame
cd mindgame
npm install
```

Set up your .env file

Example .env file

```.env
DISCORD_TOKEN=Discord bot token
DISCORD_CLIENT_ID=Discord application client ID
MONGO_URI=MongoDB connection string (IMPORTANT: put the database name at the end of the connection string)
OWNER_ID=Your Discord ID
```

Change the application config to your needs: every option is documented in `src/config/config.ts`.

Register slash commands and context menus (again after adding or changing a command):

```bash
npm run deploy-commands              # registers them globally
npm run deploy-commands -- --dry-run # only lists them
```

Before upgrading an existing database to a version that adds unique indexes, remove duplicates once (a dry run first, then `--apply`):

```bash
npx tsx scripts/dedupe-for-unique-indexes.ts
npx tsx scripts/dedupe-for-unique-indexes.ts --apply
```

### 🏠 Local

Start application (watch mode for development; Docker runs `node --import tsx src/index.ts`)

```bash
npm run start
```

Checks

```bash
npx tsc --noEmit
npm run lint
npm test
```

### 🐳 Docker

Build Docker image

```bash
docker build -t mindgame .
```

Run Docker container (the bot exits on fatal errors, the restart policy brings it back)

```bash
docker run -d --restart unless-stopped --env-file .env mindgame
```

Hosting MongoDB in other container?

```bash
docker run -d --restart unless-stopped --env-file .env --link [container_name]:[alias] mindgame
```

- Replace `[container_name]` with your MongoDB container name
- Replace `[alias]` with your MongoDB container alias

Your `MONGO_URI` in `.env` file should look like this:

```.env
MONGO_URI=mongodb://[alias]:[your_port]/[database_name]
```
