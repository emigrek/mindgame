---
name: add-achievement
description: Checklist for adding a new achievement to the Mindgame bot. Use when creating or registering an achievement, so that no step is missed (enum, types, registries, trigger, both translations, README).
---

# Add an achievement

Use `src/modules/achievement/achievements/regular.ts` (gradual) or `ghost.ts` (single-level) as the template.

1. **`src/interfaces/AchievementType.ts`**
   - **Append** the new member to `enum AchievementType`. It is stored in MongoDB as a number, so never insert or reorder.
   - Add an entry to `AchievementTypePayload`, the state persisted with `updatePayload`.
   - Add an entry to `AchievementTypeContext`, the data the trigger passes to `progress`.
2. **`src/modules/achievement/achievements/<name>.ts`**
   - Extend `GradualAchievement<T>`: set `levels` to an array of `{ value, level }` (plus `lowerIsBetter` if a lower value is better) and return `this.reach(value)` from `progress`. For a single-level achievement, extend `BaseAchievement<T>` and call `this.setLevel(1)` instead.
   - Set `emoji` and implement `async progress(context)`.
   - Set `emojiImage` to the emoji's Windows 10 Anniversary Update image from Emojipedia (`https://em-content.zobj.net/source/microsoft/74/<name>_<codepoint>.png`). If the emoji is newer than that update, use the oldest Microsoft version in the same style. It is the notification thumbnail.
   - Override `statusParams(payload)` to shape the values used in the translated status. Use `formatDuration` from `@/utils/date` for durations.
   - Set `announceLevelJumps = false` if the first check can jump several levels.
   - For hour or day logic, use `getWarsawHour` / `getWarsawDay`.
3. Export the class from `src/modules/achievement/achievements/index.ts`.
4. Add `new X()` to `getAllAchievements()` in `src/modules/achievement/index.ts`. This list drives the profile page.
5. **Trigger** it from the relevant event(s) with `new AchievementManager({ client, userId, guildId }).check(new X(context))`.
   - Create a fresh instance for every user.
   - Voice triggers shared by several achievements live in `achievements/checks.ts` (`checkVoiceChannelMembers`, `checkVoiceSessionEnd`). Extend those instead of adding new listeners.
6. **Translations:** under `achievements."<numeric enum index>"`, add `name`, `status` (MessageFormat `{param}`) and `description`. Add them to **both** `src/translations/en-US.json` and `pl.json`, which are indented with tabs.
7. Add a row to the achievements table in `README.md`.
8. Verify with `npx tsc --noEmit` and `npm run lint`.
