# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` runs `tsx watch src` for development. Production (Docker) runs `npm run prod` (`tsx src`). Watch mode doesn't exit when the bot crashes, so it must never be the production command. There is no build step.
- Verify changes with `npx tsc --noEmit` (tsx doesn't typecheck), `npm run lint` and `npm test`. `npm test` runs `src/**/*.test.ts` with `node:test` via tsx, and test files must import only pure modules (no Mongo, no `@/config/keys`). There is no CI.
- Slash commands are not auto-registered (`autoPutSlashCommands: false` in `src/config/config.ts`). After adding or changing a command, set it to `true` for one run, then set it back to `false`. It PUTs the commands globally.

## Architecture gotchas

- Nothing is auto-discovered. New events, commands, buttons, selects, contexts, modals and modules must be added to the array in their folder's `index.ts`.
- Buttons, selects and modals are dispatched in `src/events/interactionCreate.ts` by an exact `customId` match.
- Modules start in the `clientReady` event, not in `ExtendedClient.init()`.
- Many events are custom and fired with `client.emit`. `src/modules/timers.ts` emits `minute`, `daily` and the other timer events from cron.
- `AchievementType` is a numeric enum persisted in MongoDB, and translation keys use the numeric index. Only append to it; never reorder or insert members.
- Per-user UI state (pagination, filters) lives in in-memory `src/stores/` and is lost on restart.
- MongoDB/Mongoose has no migrations, and payloads are `Mixed`. Schema changes must stay backward compatible with existing documents.
- Level roles and color roles are identified by IDs stored in the Guild document (`levelRoleIds`, `colorRoleIds`), never by role name, because admins rename them. Only roles with a stored ID may be modified or deleted.

## i18n

- All user-facing text goes through `i18n.__()`, or `i18n.__mf()` when it has `{params}`. Add every key to both `src/translations/en-US.json` and `pl.json`; those files are indented with tabs.
- The i18n locale is global mutable state. Call `i18n.setLocale()` (from `interaction.locale` or `guild.preferredLocale`) before building any text, or it inherits whatever locale was set last. Even then, a concurrent flow can switch it across any `await` (TECH_DEBT_AUDIT.md F05); don't add new awaits between `setLocale` and `__()`.

## Dates

- New date and time logic uses Europe/Warsaw (`getWarsawHour` and `getWarsawDay` in `src/utils/date.ts`). Cron runs in Europe/Warsaw, and the Docker image sets `TZ=Europe/Warsaw`. Daily and streak logic in `src/modules/activity/` still uses the process timezone; outside Docker that can differ.

## Style

- 4-space indent, double quotes, semicolons. Import from `src` through the `@/` alias.
- Use named exports for new commands, events and selects. Follow the existing default-export files for buttons, contexts and modals.

## Git

- Commit straight to `main`. Subject: imperative, sentence case, no conventional-commit prefix (e.g. "Add Regular achievement for time spent on the server"). Body: a `- ` bullet list.
- Never read, quote or commit `.agent-office/`. It is a local tool folder that contains secrets.
