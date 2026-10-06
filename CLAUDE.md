# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` runs `tsx watch src` for development. Production (Docker) runs `npm run prod` (`tsx src`). Watch mode doesn't exit when the bot crashes, so it must never be the production command. There is no build step.
- Verify changes with `npx tsc --noEmit` (tsx doesn't typecheck), `npm run lint` and `npm test`. `npm test` runs `src/**/*.test.ts` with `node:test` via tsx, and test files must import only pure modules (no Mongo, no `@/config/keys`). There is no CI.
- Keep `winmojilib` in `package.json`: `winemoji` requires it at runtime without declaring it, so depcheck and knip report it as unused.
- Slash commands are not auto-registered (`autoPutSlashCommands: false` in `src/config/config.ts`). After adding or changing a command, set it to `true` for one run, then set it back to `false`. It PUTs the commands globally.

## Architecture gotchas

- Nothing is auto-discovered. New events, commands, buttons, selects, contexts, modals and modules must be added to the array in their folder's `index.ts`.
- Buttons, selects and modals are dispatched in `src/events/interactionCreate.ts` by the `customId` part before the first `:`. The rest is passed to `run(client, interaction, ...args)`. Profile components carry `:<targetUserId>:<page>` (added by `ProfilePagesManager`, read by `restoreProfileState`), so clicks on older messages act on the profile they show.
- Handlers may throw: `interactionCreate` logs the error with context and replies to the user with an error message.
- Modules start in the `clientReady` event, not in `ExtendedClient.init()`.
- Many events are custom and fired with `client.emit`. `src/modules/timers.ts` emits `minute`, `daily` and the other timer events from cron.
- `AchievementType` is a numeric enum persisted in MongoDB, and translation keys use the numeric index. Only append to it; never reorder or insert members.
- Per-user UI state (pagination, filters) lives in in-memory `src/stores/` and is lost on restart.
- MongoDB/Mongoose has no migrations, and payloads are `Mixed`. Schema changes must stay backward compatible with existing documents.
- Indexes are declared in `src/modules/schemas/*` and built by Mongoose autoIndex at startup. A new unique index fails to build while duplicates exist, so first add a rule to `scripts/dedupe-for-unique-indexes.ts` and run it (dry run by default, `--apply` to change data).
- Open voice and presence sessions get `lastSeenAt` on every experience tick. Sessions that ended unseen are closed at it (`closeAtLastSeen`), never deleted.
- Statistics writes must stay atomic: use `updateUserGuildStatistics` (`$inc`), never `findOne` + `save()`. `getUserGuildStatistics` never inserts; a missing document reads as zeros.
- Level roles and color roles are identified by IDs stored in the Guild document (`levelRoleIds`, `colorRoleIds`), never by role name, because admins rename them. Only roles with a stored ID may be modified or deleted.

## i18n

- All user-facing text goes through `i18n.__()`, or `i18n.__mf()` when it has `{params}`. Add every key to both `src/translations/en-US.json` and `pl.json`; those files are indented with tabs.
- Every event handler runs in its own locale scope (`runInLocaleScope` in `src/client/i18n.ts`, wired in `ExtendedClient.loadEvents`). `i18n.setLocale()` (from `interaction.locale` or `guild.preferredLocale`) affects only the rest of the current event and defaults to en-US. Code running outside an event, such as startup or import time, always gets en-US.

## Dates

- New date and time logic uses Europe/Warsaw (`getWarsawHour` and `getWarsawDay` in `src/utils/date.ts`). Cron runs in Europe/Warsaw, and the Docker image sets `TZ=Europe/Warsaw`. The daily reward and voice streaks count Warsaw calendar days (`src/modules/activity/streak.ts`).

## Style

- 4-space indent, double quotes, semicolons. Import from `src` through the `@/` alias.
- Use named exports for new commands, events and selects. Follow the existing default-export files for buttons, contexts and modals.

## Git

- Commit straight to `main`. Subject: imperative, sentence case, no conventional-commit prefix (e.g. "Add Regular achievement for time spent on the server"). Body: a `- ` bullet list.
- Never read, quote or commit `.agent-office/`. It is a local tool folder that contains secrets.
