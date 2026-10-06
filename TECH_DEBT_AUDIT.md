# Audyt długu technicznego — Mindgame

Wygenerowano: 2026-10-06 · commit `aa327bb` · zakres: cały `src/` (~8 900 LOC TypeScript, 199 plików), Dockerfile, konfiguracja, tłumaczenia.

**Metoda:**
- Orientacja w kodzie i historii (675 commitów, churn).
- 4 równoległe przeglądy obszarów:
  - rdzeń, eventy i interakcje
  - warstwa UI (`messages`) i tłumaczenia
  - warstwa danych i śledzenie czasu
  - osiągnięcia, ephemeral channels i utils
- Narzędzia: `tsc`, `eslint`, `npm audit`, `knip`, `depcheck`, `madge`.

Najpoważniejsze tezy zweryfikowałem osobno w kodzie. W tabeli oznacza je **✔** przy ID.

---

## Status wdrożenia (2026-10-06)

Naprawione (**✅** w tabeli):
- Partia 1 (role po ID i szybkie poprawki): F01, F02, F03, F11, F13, F14, F15, F17, F21, F23, F24, F25, F26, F27, F31, F35, F38, F39, F41, F46, F52, F62, F66, F67.
- Partia 2 (pozycje High): F04, F05, F09, F12, F16, F18, F19, F22, F29, F30, F49.
- Partia 3 (integralność danych): F06, F07, F08, F20, F28, F58, F73.

**Wdrożenie partii 3 wymaga kroku na bazie.** Unikalne indeksy nie zbudują się, dopóki istnieją duplikaty (bot wystartuje, ale bez ochrony przed nowymi duplikatami):
1. `npx tsx scripts/dedupe-for-unique-indexes.ts` – tylko raport, nic nie zmienia.
2. `npx tsx scripts/dedupe-for-unique-indexes.ts --apply` – scala statystyki (sumuje liczniki), zostawia najwcześniejszą otwartą sesję, najwyższy poziom osiągnięcia, najnowszy dokument użytkownika i pierwszy dokument serwera.
3. Dopiero potem start bota; Mongoose zbuduje indeksy.

Skrypt sprawdzony na Mongo w pamięci: suche uruchomienie nic nie zmienia, `--apply` scala zgodnie z regułami, indeksy budują się potem bez błędów; 50 równoległych zapisów statystyk daje dokładnie sumę, równoległe starty sesji otwierają jedną.

**Zamierzone, bez zmian** (**⊘** w tabeli, decyzja właściciela):
- F10: EXP rośnie z długością sesji celowo.
- F54: bez cooldownu EXP za wiadomości.
- F53: wyjście z serwera kasuje statystyki.
- F33: każdy członek może sweepować.
- F34: obserwowanie jest globalne.
- F36: wyciszeni (deaf) nie liczą się jako obecni.

Do zrobienia zgodnie z decyzją: F58 (Comeback liczony per serwer) i F16 (stan w customId, zrobione w partii 2).

**Role poziomu i koloru są teraz rozpoznawane po ID, nie po nazwie** (decyzja właściciela; zastępuje rekomendację z F01 i F03):
- **Zapis ID:**
  - `Guild.levelRoleIds` przechowuje mapę próg → ID roli.
  - `Guild.colorRoleIds` przechowuje mapę użytkownik → ID roli.
- **Personalizacja:** admin może dowolnie zmieniać nazwy, kolory i ikony ról. `roleUpdate.ts`, który pilnował liczby w nazwie, został usunięty.
- **Wyłączenie ról poziomu nadal je usuwa** (decyzja właściciela), ale tylko role ze zapisanymi ID. Jeśli usunięcie którejś się nie uda, jej ID zostaje zapisane, flaga się nie przełącza i kolejne kliknięcie ponawia próbę.
- **Przejęcie starych ról:**
  - Odbywa się jednorazowo i tylko na serwerach z włączonymi rolami poziomu.
  - Dla każdego progu wybór idzie w kolejności: jedyny kandydat z daną liczbą w nazwie, potem dokładnie „Level N”, potem kolor progu.
  - Gdy dalej nie da się rozstrzygnąć, próg jest pomijany i zapisywany w logu, a rola powstanie od nowa przy pierwszej potrzebie.
  - Logikę pokrywa `src/modules/roles/thresholds.test.ts` (`npm test`).
- **Brakujące role** są tworzone po kolei przed masowym przydziałem. Każde ID jest zapisywane od razu, więc przerwany przebieg jest wznawiany, a nie tworzy duplikatów (F31).
- **Stare role koloru** są przejmowane, gdy mają „🎨” w nazwie i nie dzieli ich nikt inny według cache członków.

---

## Podsumowanie

Rozkład findingów: **2 Critical · 30 High · 45 Medium · 8 Low** (razem 85).

1. **Dwie operacje niszczące dane na serwerach.**
   - Regex ról poziomu `\b\d+\b` uznaje za „rolę poziomu” każdą rolę z liczbą w nazwie („18+”, „Top 10”). Wyłączenie level roles **usuwa je z serwera** (F01).
   - Rola koloru jest rozpoznawana po samym `includes("🎨")`. Gdy członek wychodzi z serwera, bot usuwa taką rolę, nawet jeśli jest wspólna dla wielu osób (F03).
2. **Sekrety trafiają do obrazu Dockera.** Nie ma `.dockerignore`, a `COPY . .` kopiuje `.env` i `.agent-office/` do warstw obrazu (F02).
3. **Bot w produkcji nie podniesie się po crashu.**
   - `tsx watch` jest CMD kontenera. Sprawdziłem testem, że watch nie kończy procesu, gdy dziecko padnie, więc kontener „żyje”, a bot jest martwy.
   - `uncaughtException` jest połykany (F04).
4. **Brak atomowości i ograniczeń w bazie.**
   - Każdy zapis to read-modify-write bez unikalnych indeksów, a architektura eventowa gwarantuje współbieżność: jeden `voiceStateUpdate` to kilka eventów.
   - Skutki: gubione EXP oraz duplikaty statystyk, otwartych aktywności i osiągnięć (F06–F08, F19, F20).
   - Na gorących ścieżkach nie ma ani jednego indeksu (F28).
5. **Globalny locale i18n jest współdzielony przez równoległe przepływy.** Embedy wychodzą pół po polsku, pół po angielsku, a powiadomienia trafiają w złym języku (F05).
6. **Stan UI jest trzymany per użytkownik, a nie per wiadomość.**
   - „Obserwuj” obserwuje złą osobę.
   - Paginacja osiągnięć nie działa na cudzym profilu.
   - Select stron na starej wiadomości pokazuje **prywatne strony innego użytkownika** (F14–F16).
7. **Czas działa niespójnie.**
   - Cron chodzi w UTC.
   - Streak liczony przez `dayOfYear()` zrywa się w Sylwestra.
   - EXP rośnie nadliniowo z długością sesji: 24 h solo daje rząd 1M EXP, a 1 h około 1k (F10–F12).
8. **Interakcje nie mają obsługi błędów.**
   - Użytkownik widzi „myśli…” w nieskończoność.
   - Na serwerze z ponad 25 kanałami tekstowymi `/config` nigdy się nie otworzy (F17, F18).
9. **Ephemeral channels:**
   - przypięte wiadomości i tak są kasowane,
   - nieudane `delete` jest ponawiane co minutę w nieskończoność, co grozi banem Cloudflare za nieprawidłowe requesty,
   - forwardy nigdy nie są sprzątane (F23–F25).
10. **Nowe serwery nie dostają żadnych powiadomień** przez złą kolejność wywołań w `guildCreate` (F13). Projekt nie ma testów ani CI, a dwa god files (`messages/index.ts`, `activity/index.ts`) przyjęły razem 319 commitów.

---

## Model mentalny architektury

Mindgame to monolit w jednym procesie: discord.js 14 + `discord-logs` (rozbija `voiceStateUpdate` na eventy semantyczne) + Mongoose.

**Start:**
1. `src/index.ts` → `src/client/index.ts` → `ExtendedClient.init()`.
2. `init()` ładuje **ręcznie utrzymywane tablice** komend, przycisków, selectów, kontekstów, modali i eventów, potem loguje bota.
3. Moduły (Mongo, presence, timery cron, walidacja aktywności, ephemeral channels) startują dopiero w evencie `clientReady`.

**Rdzeń domenowy to śledzenie czasu:**
- Eventy voice i presence otwierają dokumenty `VoiceActivity` / `PresenceActivity` (`to: null`).
- Cron `minute` (`ExperienceUpdater`) co minutę dolicza każdej otwartej aktywności +60 s i losowe EXP do `UserGuildStatistics`, w kubełkach `total/day/week/month`.
- `daily/weekly/monthly` zerują kubełki tymczasowe.

**Na tym fundamencie stoją:**
- poziomy i role poziomów,
- nagrody dzienne i streak,
- osiągnięcia (`AchievementManager`, fire-and-forget, wyzwalane z eventów),
- powiadomienia (`NotificationsManager`, kolejka per kanał z odstępem 750 ms),
- warstwa UI: `messages/index.ts` buduje wszystkie embedy, a stan paginacji i filtrów żyje w in-memory `stores` kluczowanych `userId`.

**Cztery systemowe słabości** powtarzają się w całym kodzie:
1. **Brak atomowości i ograniczeń w DB.** Wszystkie zapisy to `findOne → modyfikacja → save()` bez unikalnych indeksów, a architektura eventowa zapewnia, że ten sam dokument jest modyfikowany równolegle.
2. **Globalny mutowalny stan współdzielony przez równoległe przepływy:** locale i18n, stores per `userId`, flagi w singletonie `NotificationsManager`.
3. **Błędy połykane przez `console.log`.** Nie ma centralnej obsługi błędów ani dla interakcji, ani dla eventów.
4. **Dwie definicje „dnia”:** UTC procesu (cron, streak, statystyki) i Europe/Warsaw (Night Owl, Host).

**Rozjazd z README:**
- README podaje Node 18, Nodemon i `autoPutSlashCommands: true`.
- W rzeczywistości jest Node 22, tsx bez Nodemona, a flaga ma wartość `false` i nie istnieje żaden skrypt deployu komend (F80).

---

## Wyniki narzędzi

| Narzędzie | Wynik |
|---|---|
| `npx tsc --noEmit` | 0 błędów |
| `npm run lint` | 0 błędów, 22 ostrzeżenia: 15× `no-explicit-any` w `interfaces/*`, 5× `no-unused-expressions`, 3× `no-unused-vars` w `roles/index.ts` |
| `npm audit` | 5× moderate, jeden łańcuch: `node-vibrant → @jimp → file-type` (pętla w parserze ASF). Niskie ryzyko, bo avatary to PNG/GIF/WebP z CDN Discorda. |
| `depcheck` / `knip` | Nieużywane zależności: `axios`, `winmojilib`, `ts-node`. `discord-api-types` nie jest importowane bezpośrednio. 15 nieużywanych eksportów, 6 nieużywanych typów, 1 nieużywany członek enuma. |
| `madge --circular` | 114 cykli. Większość to importy wartości używane wyłącznie jako typy (`import X` zamiast `import type X`), które esbuild usuwa w runtime. **Co najmniej 3 są realne w runtime** (F69). |
| Testy / CI | Brak |

---

## Findings

Legenda: **✔** = zweryfikowane osobno w kodzie · **✅** = naprawione · **◐** = naprawione częściowo · **⊘** = zamierzone, bez zmian. Effort: S < 1 h, M ≈ pół dnia, L = dni. Numery linii odnoszą się do commita `aa327bb`.

| ID | Kategoria | Plik:linia | Sev | Eff | Opis | Rekomendacja |
|---|---|---|---|---|---|---|
| F01 ✔ ✅ | Utrata danych | src/modules/roles/index.ts:13 | Critical | S | `levelRoleRegExp = /\b\d+\b/` łapie każdą rolę z liczbą w nazwie („18+”, „Top 10”, „Klasa 3”). Skutki: wyłączenie level roles usuwa te role z serwera (:155-162); level-up zdejmuje je członkom (:35-39, :124-128); hoist je przełącza (:75-79); `roleUpdate.ts:14` cofa zmiany ich nazw. `specificLevelRoleRegExp` (:14) bierze „Top 10” za rolę poziomu 10. | **Wdrożone:** ID ról poziomu w `Guild.levelRoleIds`, bo dowolne nazwy były zamierzone (patrz Status wdrożenia). |
| F02 ✔ ✅ | Bezpieczeństwo | Dockerfile:5 | Critical* | S | Nie ma `.dockerignore`, a `COPY . .` wkleja do warstw obrazu `.env` (token, `MONGO_URI` z hasłem), `.agent-office/` (hasła), `.git` i windowsowe `node_modules`. Dodatkowo: `npm install` zamiast `npm ci`, devDependencies w obrazie, proces jako root, `EXPOSE 3000` bez serwera HTTP. *Critical, jeśli obraz opuszcza maszynę. | `.dockerignore` z `.env*`, `.agent-office`, `.git`, `node_modules`, `.idea`. Sekrety tylko przez `--env-file`, `npm ci --omit=dev`, `USER node`. |
| F03 ✔ ✅ | Utrata danych | src/modules/roles/index.ts:202 | High | S | `getMemberColorRole` bierze dowolną rolę, której nazwa zawiera „🎨”. Przy wyjściu członka (`guildMemberRemove.ts:17`) i po kliknięciu „wyłącz” (`roleColorDisable.ts:28`) bot **usuwa tę rolę z całego serwera**, np. wspólną „🎨 Artyści”. | **Wdrożone:** ID roli koloru per członek w `Guild.colorRoleIds`; usuwana jest tylko rola o zapisanym ID. |
| F04 ✔ ✅ | Niezawodność | package.json:5, src/process.ts:1 | High | S | Produkcja działa na `tsx watch`. Watch nie kończy procesu po crashu dziecka (sprawdzone testem), więc restart policy Dockera nie zadziała, a `exit(1)` w `ExtendedClient.ts:48` i `database.ts:12` niczego nie restartuje. `uncaughtException` jest tylko logowany i proces działa dalej w nieokreślonym stanie. Brak obsługi SIGTERM. | Skrypt `"prod": "tsx src"` jako CMD plus `--restart unless-stopped`. `uncaughtException` → log + `process.exit(1)`. SIGTERM → `client.destroy()` + `mongoose.disconnect()`. |
| F05 ✔ ✅ | Poprawność / i18n | src/events/interactionCreate.ts:12; src/modules/messages/index.ts:237 (+483, 521, 760, 796, 837, 901); src/modules/user/index.ts:129 | High | M | Locale jest jednym globalnym stanem. Ścieżka to `setLocale`, potem kilka `await`, potem `__()`. Równoległa interakcja albo powiadomienie przełącza język w trakcie renderowania. Dotyczy też `BaseAchievement.ts:91-98`. | `AsyncLocalStorage` w `src/client/i18n.ts` (Top 5 #3). Około 170 wywołań `i18n.__` zostaje bez zmian. |
| F06 ✔ ✅ | Integralność danych | src/modules/user-guild-statistics/userGuildStatistics.ts:50-67 | High | M | `findOne → merge → save()` nadpisuje całe kubełki, więc równoległe zapisy gubią inkrementy. Zapisują: `messageCreate.ts:21`, `interactionCreate.ts:64`, `activity/index.ts:22/41` i tick `ExperienceUpdater.ts:153`. O 00:00 `minute` i `daily` odpalają w tym samym ticku, więc tick może zapisać stare day/week/month po ich wyzerowaniu. | Atomowe `findOneAndUpdate({$inc})` z upsertem plus warunkowy `updateOne` poziomu (Top 5 #4). |
| F07 ✅ | Integralność danych | src/modules/user-guild-statistics/userGuildStatistics.ts:25-27 | High | S | Brak unikalnego indeksu `{userId, guildId}`, więc równoległe „pierwsze zapisy” tworzą duplikaty, a ranking liczy oba. Ścieżki *odczytu* też tworzą dokumenty (`roles/index.ts:96`, strony profilu). Osoba, która wyszła z serwera, wraca do rankingu z 0 EXP po otwarciu jej profilu. | Deduplikacja, potem indeks unikalny. Upsert tylko przy zapisie; odczyt zwraca wartości domyślne bez insertu. |
| F08 ✅ | Integralność danych | src/modules/activity/index.ts:85-119; src/events/presenceUpdate.ts:34,42 | High | S | Otwieranie aktywności to check-then-insert bez ograniczenia w bazie. Seria `presenceUpdate` (desktop↔mobile) otwiera 2 `PresenceActivity`, a `endPresenceActivity` zamyka jedną, więc druga nalicza EXP bez końca. Voice ma ten sam problem. | Partial unique index `{userId, guildId}` z `to: null`; łapać E11000 w `start*` i zwracać istniejący dokument. |
| F09 ✅ | Poprawność | src/modules/activity/index.ts:213-259, :224 | High | M | Presence nie ma odpowiednika `closeStaleVoiceActivities`. Zgubiony event offline albo usunięcie bota z serwera zostawia aktywność otwartą na zawsze, bo walidacja robi `continue`, gdy nie ma guild. Nie ma handlera `guildDelete`. | `closeStalePresenceActivities` na `guild.presences.cache`; zamykać zamiast `continue`; nowy event `guildDelete`. |
| F10 ✔ ⊘ | Ekonomia | src/modules/experience/ExperienceCalculator.ts:9,14; src/config/config.ts:15-30 | High | S | Nagroda za tick to `sekundy_od_startu_sesji × value × multiplier`, więc EXP rośnie nadliniowo z długością sesji: 1 h voice ≈ 1k EXP, 24 h solo ≈ 1–2M. Klient online całą dobę przez 30 dni ≈ poziom 80. Sesje presence przeżywają zmiany statusu i restarty bota. | Ograniczyć sekundy w formule (np. `min(s, 2h)` dla voice, 1 h dla presence) albo stała stawka za minutę. **Najpierw potwierdzić intencję** (pytanie 1). |
| F11 ✔ ✅ | Strefa czasowa | src/modules/timers.ts:47 | High | S | Cron działa w TZ procesu (UTC w Dockerze), więc day/week/month resetują się o 01:00 albo 02:00 czasu PL. Night Owl i Host liczą dni warszawskie, a `regular.ts`, `utils/date.ts:3-37` i `zodiac.ts` używają czasu lokalnego. W bocie są trzy definicje „dnia”. | `cron.schedule(expr, fn, { timezone: "Europe/Warsaw" })` plus `ENV TZ=Europe/Warsaw` w Dockerfile. |
| F12 ✅ | Poprawność | src/modules/activity/index.ts:34-37, :464 | High | M | Daily reward i streak liczą dni UTC i używają `dayOfYear() === last.dayOfYear() + 1`. Przejście 31.12→1.01 zawsze zrywa streak, a ten sam dzień roku rok później liczy się jako kolejny. | Klucze dni warszawskich (`getWarsawDay`) i różnica numerów dni (Top 5 #2). |
| F13 ✔ ✅ | Poprawność | src/events/guildCreate.ts:52-54 | High | S | `setDefaultChannelId` wywołuje się przed `createGuild`, więc na nowym serwerze nic się nie zapisuje i zostaje `channelId: null`. Wszystkie powiadomienia (level-up, daily, streak, osiągnięcia) przepadają bez śladu, dopóki admin nie wejdzie w `/config`. | Zamienić kolejność. Preferować `guild.systemChannel` z uprawnieniem SendMessages. |
| F14 ✔ ✅ | Prywatność | src/modules/messages/pages/profilePagesManager.ts:35 | High | S | `getPageByType` nie sprawdza `visible`. Select stron na starszej wiadomości własnego profilu renderuje **prywatne** strony innego użytkownika (`presenceActivity.ts:78`, `timeStatistics.ts:80`). | `this.pages.find(p => p.type === type && p.visible) ?? this.pages[0]` |
| F15 ✔ ✅ | Poprawność | src/modules/messages/pages/profile/achievements.ts:31,82,101 | High | S | Strona osiągnięć czyta stan po `renderedUser`, a handlery zapisują go po widzu (`achievementsPageDown.ts:11`, `achievementsPageUp.ts:11`, `achievementsDisplaySelect.ts:25`). Na cudzym profilu paginacja i filtr nie działają, a licznik może zejść do 0 („Strona 0 z N”). | `this.params.sourceUser.userId` plus clamp `Math.min(Math.max(1, page), pages)`. |
| F16 ✅ | Poprawność | src/stores/index.ts:19-29; src/interactions/buttons/profileFollow.ts:14 | High | M | Stan UI jest kluczowany `userId`, a nie wiadomością. „Obserwuj” na starszym profilu obserwuje osobę otwartą jako ostatnią. Page-up na starym rankingu daje stronę 0, czyli `$skip` < 0 (`userGuildStatistics.ts:166`), wyjątek i wiszącą interakcję. Stan miesza się między serwerami, nie jest nigdy czyszczony i znika po restarcie. | Cel w customId (`profileFollow:<id>`) i routing po prefiksie w `interactionCreate.ts:84-87` (Top 5 #5). Clamp stron. |
| F17 ✔ ✅ | Poprawność | src/modules/messages/index.ts:145-159 | High | S | `/config` dodaje do selecta opcję dla każdego kanału tekstowego bez limitu. Powyżej 25 kanałów albo przy nazwie dłuższej niż 99 znaków builder rzuca wyjątek i deferred reply wisi, więc taki serwer nigdy nie otworzy `/config`. | `ChannelSelectMenuBuilder().setChannelTypes(ChannelType.GuildText)` (natywny select kanałów). |
| F18 ✅ | Obsługa błędów | src/events/interactionCreate.ts:59-92 | High | S | Wszystkie 5 ścieżek kończy się `.catch(e => console.log(\`${e}\`))`. Skutki: użytkownik nie dostaje odpowiedzi, stack trace przepada, nieznany customId jest ignorowany bez śladu. Licznik komend (:64) nie jest awaitowany i liczy też komendy zakończone błędem. | Centralny wrapper: log z kontekstem i efemeryczna odpowiedź z błędem; „panel wygasł” dla nieznanych ID (Top 5 #5). |
| F19 ✅ | Wyścigi | src/modules/achievement/structures/AchievementManager.ts:39-45; BaseAchievement.ts:58-74 | High | M | `discord-logs` emituje kilka eventów z jednego `voiceStateUpdate` (join+deaf, leave+streamStop), a każdy event voice przelicza Suss i Social dla całego kanału. Równoległe checki tego samego osiągnięcia to więc norma. Read-modify-write payloadu powoduje podwójne ogłoszenia level-up, gubi `userIds` w Social i inkrementy DJ, NightOwl i Host. | Kolejka promise per `${userId}:${guildId}:${type}` w `AchievementManager` (Top 5 #4). |
| F20 ✅ | Integralność danych | src/modules/schemas/Achievement.ts:9-36 | High | S | Brak unikalnego indeksu `{userId, guildId, achievementType}`, a każdy check robi dwa osobne upserty (payload, potem level). Powstają duplikaty, `findOne` zwraca jeden z nich losowo, więc poziom „skacze” i jest ogłaszany ponownie. | Deduplikacja i indeks unikalny; payload i level w jednym `updateOne`. |
| F21 ✔ ✅ | Poprawność | src/events/voiceChannelJoin.ts:14-20; voiceStreamingStart.ts:17 | High | S | Regular, Ghost i Streamer są sprawdzane bez filtra botów, więc boty muzyczne dostają publiczne ogłoszenia „Regular” w kolejne rocznice. | Jedna linia w `AchievementManager.check`: `if (client.users.cache.get(userId)?.bot) return this;` |
| F22 ✅ | Poprawność | src/modules/achievement/achievements/suss.ts:29-38; streamer.ts:26-39 | High | M | Otwarty interwał (`Suss.from`, `Streamer.last`) przeżywa restarty, zgubione eventy leave i sesje zamknięte przez sweep. Następny check dolicza `now - from`, czyli dni albo tygodnie, co zawyża statystyki i daje nienależne najwyższe poziomy. | Zapisywać przy interwale ID aktywności. Jeśli tamta sesja nie jest już otwarta, liczyć tylko do jej `to`. |
| F23 ✔ ✅ | Poprawność | src/modules/ephemeral-channel/index.ts:132-141 | High | S | `try { return fetch(...) }` bez `await`, więc odrzucony promise omija catch. Odpowiedzi na usunięte wiadomości i forwardy rzucają wyjątek. Skutki: forwardy nigdy nie trafiają do cache, więc nie są kasowane; w `messageReactionAdd.ts:18` wyjątek przerywa handler, więc wiadomość z reakcją zostaje skasowana mimo `keepMessagesWithReactions`. | `.catch(() => null)`; zwracać `null`, gdy `reference.channelId !== message.channelId`. |
| F24 ✅ | Utrata danych | src/modules/ephemeral-channel/index.ts:61-68 | High | S | Przypięcie jest sprawdzane tylko przy dodaniu wiadomości do cache, więc wiadomość przypięta później i tak zostanie skasowana. Ankiety mają ten sam problem (:113). | Sprawdzać `message.pinned` przed delete; event `messagePinned` (emituje go discord-logs) usuwa wiadomość z cache. |
| F25 ✅ | Rate limit | src/modules/ephemeral-channel/index.ts:65-72, 91 | High | S | Nieudany delete (50013/10008/10003) zostaje w cache i jest ponawiany co minutę bez końca. Każde 4xx wlicza się do limitu 10 tys. nieprawidłowych requestów na 10 min, którego przekroczenie kończy się banem Cloudflare. Kanał usunięty w czasie offline rzuca wyjątek przy każdym starcie. | Przy trwałych kodach błędów usuwać wiadomość lub kanał z cache i DB. Przy `create` sprawdzać uprawnienia ManageMessages i ReadMessageHistory. |
| F26 ✅ | Poprawność | src/modules/messages/index.ts:888-896 | High | S | Sweep wysyła do 100 pojedynczych delete w `Promise.all`. Jeden błąd daje raport „Swept 0” i brak quick buttons, chociaż reszta wiadomości się usunęła. | `channel.bulkDelete(msgs, true)` + `allSettled` dla reszty; quick buttons poza catch. |
| F27 ✅ | Poprawność | src/events/userLeveledUp.ts:44; src/events/ready.ts:27 | High | S | Jeśli śledzona wiadomość zostanie usunięta, gdy bot jest offline, `messages.fetch` rzuca poza catch. Ten użytkownik na zawsze traci powiadomienia level-up w tym kanale; to samo dotyczy invite w `ready.ts`. | `fetchTrackedMessage()`: przy 10008 usuwa dokument i wysyła nową wiadomość. |
| F28 ✅ | Wydajność | src/modules/schemas/*.ts | High | M | Na gorących ścieżkach nie ma żadnego indeksu (jedyny jest w `EphemeralChannel.ts:14`): `presenceUpdate`, najczęstszy event, robi `findOne` na rosnącej kolekcji; tick co minutę skanuje całą kolekcję po `{to: null}`; `getGuild` leci przy prawie każdym evencie; `deleteOne({messageId})` przy każdym usunięciu wiadomości. | [Plan indeksów](#plan-indeksów). Przed indeksami unikalnymi zrobić deduplikację. |
| F29 ✅ | Wydajność | src/modules/user-guild-statistics/userGuildStatistics.ts:129-140, :202-216, :80-93 | High | S | Ranking robi `$lookup` do `users` dla każdego dokumentu ze **wszystkich** serwerów, zanim zastosuje `$match {guildId}`, a `users` nie ma indeksu. Pozycja w rankingu ładuje cały serwer do Node tylko po to, żeby zrobić `findIndex`. `$unwind` gubi osoby bez dokumentu User, a brak tie-breakera daje niestabilną paginację. | `$match` przed `$lookup`, `preserveNullAndEmptyArrays`, sort `_id: 1`; rank = `countDocuments({"total.exp": {$gt: x}}) + 1`. |
| F30 ✅ | Wydajność | src/modules/activity/index.ts:19, :444-461 | High | S | Każde wejście na voice ładuje **wszystkie** aktywności voice użytkownika (bez indeksu i bez `lean`) i liczy streak w O(n²). Dzieje się to nawet wtedy, gdy nagroda nie przysługuje, bo streak jest liczony przed early return w :37. | Liczyć streak tylko, gdy nagroda się należy; dni przez `$group` + `$dateToString`. |
| F31 ✅ | Obsługa błędów | src/modules/roles/index.ts:134-138, :175 | High | S | `return member.roles.add()` w `try` bez `await`, więc błąd hierarchii ról ucieka z catch. `Promise.all` pada i flaga nie zostaje ustawiona, chociaż role już utworzono, więc kolejne kliknięcie tworzy duplikaty „Level N”. Członkowie są brani z cache (:92), więc niezcache'owani są pomijani. | `return await`, `allSettled` z logami, pomijać role, które już istnieją, `guild.members.fetch`. |
| F32 | Architektura | src/modules/messages/index.ts:1-984 | High | M | God file z 6 odpowiedzialnościami: kolory obrazów, DAO Mongo, utrzymanie kanałów, 6 payloadów powiadomień, 7 widoków, 4 payloady komend. Funkcje `get…Payload` mają efekty uboczne: DM do właściciela (:136), zapisy do DB (:650-710), mutacje store (:570). Plik zmieniało 180 commitów. | Podział według planu w Top 5 #5; `index.ts` zostaje jako barrel, więc importy w reszcie kodu się nie zmieniają. |
| F33 ⊘ | Bezpieczeństwo | src/interactions/contexts/sweepContext.ts:7; buttons/sweep.ts:17 | Medium | S | Sweep może uruchomić każdy członek serwera: nie ma domyślnych uprawnień ani sprawdzenia w kodzie. Kasuje też wiadomości ludzi zaczynające się od `! $ % ^ & ( ) /` (`config.ts:50`), np. „(brb)”. | `setDefaultMemberPermissions(ManageMessages)` plus sprawdzenie uprawnień w przycisku. |
| F34 ⊘ | Prywatność | src/events/userBackFromLongVoiceBreak.ts:28; modules/follow/index.ts:24 | Medium | S | Follow nie ma `guildId`. Obserwujący dostaje DM z nazwą serwera i linkiem do kanału także z serwera, którego nie jest członkiem. Payload (avatar + Vibrant) jest budowany osobno dla każdego obserwującego. | Filtrować do członków `member.guild`; payload budować raz; `allSettled`. |
| F35 ✅ | Poprawność | src/events/voiceChannelSwitch.ts:18 | Medium | S | Przejście na kanał AFK wywołuje `checkGuildVoiceEmpty` dwa razy (:18 i :26), więc lecą dwa równoległe sweepy. | Usunąć linię 18. |
| F36 ⊘ | Poprawność | src/events/guildVoiceEmpty.ts:15 | Medium | S | Po 10 s opóźnienia stan nie jest sprawdzany ponownie, więc ktoś, kto zdążył wrócić, i tak ma posprzątany kanał. Kanał z samymi wyciszonymi (deaf) liczy się jako pusty. | Ponowne sprawdzenie po opóźnieniu; deduplikacja per guild. |
| F37 | Poprawność | src/events/userReceivedDailyReward.ts:17 (+achievementLeveledUp.ts:20, userSignificantVoiceActivityStreak.ts:15, guildVoiceEmpty.ts:21, ready.ts:17) | Medium | M | `channels.fetch(id)` rzuca wyjątek na usuniętym kanale, więc warunek `if (!channel)` nigdy nie zadziała. Ten kod ma 5 kopii w 3 stylach, każda z `as TextChannel`. | `getNotificationChannel(client, guildId)` z `.catch(() => null)` i `isSendable()`. |
| F38 ✅ | Poprawność | src/events/guildCreate.ts:11, :27-28 | Medium | S | Gdy `me` nie ma w cache, check uprawnień zwraca false i **bot sam opuszcza serwer**. Jeśli właściciel ma zamknięte DM, `owner.send` rzuca, więc `guild.leave()` się nie wykona. | `guild.members.me ?? await guild.members.fetchMe()`; `send().catch()`. |
| F39 ✅ | Poprawność | src/interactions/buttons/roleColorPick.ts:14, :25 | Medium | S | Przed `showModal`, który musi się odbyć w ciągu 3 s, handler pobiera avatar i liczy Vibrant; wolny CDN kończy się „Unknown interaction”. W :14 `followUp` jest wołany przed pierwszą odpowiedzią i rzuca. | Liczyć kolor tylko, gdy go brak; w :14 użyć `reply`. |
| F40 | Poprawność | src/interactions/modals/selectOptionsModal.ts:16; messages/index.ts:583-594 | Medium | S | Sprawdzane jest tylko `< 2` opcji. Powyżej 25 opcji albo przy opcji dłuższej niż ok. 250 znaków builder rzuca i modal zostaje bez odpowiedzi. Reroll starej wiadomości po nowym `/select` pokazuje „🎯 undefined”. | Walidować 2–25 opcji po maks. 100 znaków; `setMaxLength` na TextInput. |
| F41 ✅ | Obserwowalność | src/client/ExtendedClient.ts:55 | Medium | S | `event.run.bind(null, this)`: odrzucone promise ze wszystkich 33 handlerów trafiają do `process.ts` bez nazwy eventu. | `(...a) => event.run(this, ...a).catch(e => console.error(\`[event:${name}]\`, e))` |
| F42 | Obsługa błędów | src/client/ExtendedClient.ts:62; client/index.ts:22 | Medium | S | Moduły startują sekwencyjnie, więc błąd jednego pomija resztę (timers, ephemeralChannel, callbacki `NotificationsManager`). `client.init()` nie jest awaitowany: błąd `putSlashCommands` oznacza brak logowania, a proces żyje dalej. | try/catch per moduł z nazwą w logu; `init().catch(→ exit(1))`. |
| F43 | Współbieżność | src/events/minute.ts:8-9; ExperienceUpdater.ts:46 | Medium | S | Ticki mogą się nakładać: jeśli tick trwa ponad 60 s, następny czyści mu cache (`cache.clear()`). Błąd w `deleteCachedMessages` pomija EXP z tej minuty. Kasowanie wiadomości ephemeral blokuje naliczanie EXP. | Flaga `running` z try/finally; osobny catch dla każdego zadania; ephemeral niezależnie od EXP. |
| F44 | Wydajność | src/events/daily.ts:13-23 | Medium | S | O północy: pełny fetch członków każdego serwera i równoległy check Regular dla każdego członka, czyli tysiące jednoczesnych operacji na Mongo. | Jeden `find({guildId, achievementType: REGULAR})`, poziomy liczone w pamięci, zapis tylko zmian. |
| F45 | Wydajność | src/events/messageCreate.ts:32 (+messageDelete.ts:13, messageReactionAdd.ts:16, messageReactionRemove.ts:13, messageDeleteBulk.ts:15) | Medium | S | Każda wiadomość na serwerze, także od botów, to `findOne` po ephemeral channel. `messageDeleteBulk` robi osobne zapytanie dla każdej wiadomości. | `Set<channelId>` w pamięci. |
| F46 ✔ ✅ | Utrzymanie | src/client/i18n.ts:6 | Medium | S | `updateFiles` ma domyślnie wartość true, więc każdy brakujący klucz jest dopisywany w runtime do `src/translations/*.json` (stąd zbłąkany `keepMessagesWithReactions` w en-US). Przy `retryInDefaultLocale: false` brakujący klucz PL wyświetla się użytkownikowi jako surowy klucz. | `updateFiles: false, retryInDefaultLocale: true` |
| F47 | Kruchy kontrakt | src/interactions/commands/ephemeralChannel.ts:13; messages/index.ts:611-617 | Medium | S | Nazwy opcji i subkomend są budowane przez `i18n.__()` w momencie importu, a odczytywane literałami. Zmiana tłumaczenia en-US po cichu psuje `/ephemeral-channel`. | Literały w nazwach; tłumaczenia i tak obsługuje `loadLocalizations()`. |
| F48 | Typy | src/interfaces/Event.ts:4; Command.ts:14 | Medium | M | `...args: any[]` gubi typy `ClientEvents`. Partiale są źle otypowane: `messageDelete` dostaje `PartialMessage`, a `guildMemberRemove` `PartialGuildMember` z pustym cache ról. Custom eventy są emitowane stringiem bez typów. | `Event<K extends keyof ClientEvents>` + module augmentation dla custom eventów. |
| F49 ✅ | Poprawność | src/modules/activity/index.ts:442-483 | Medium | S | Funkcja zwraca ostatni ciąg streak niezależnie od tego, jak jest stary, więc ktoś nieaktywny od miesięcy widzi „streak 12 dni”. | Jeśli ostatni dzień jest wcześniejszy niż wczoraj (Warszawa), bieżący streak = 0. |
| F50 | Integralność danych | src/modules/activity/index.ts:157-183, :230-236 | Medium | S | Walidacja przy starcie **usuwa** aktywności osób, które wyszły w czasie przestoju, więc giną dni streaka oraz baseline Host i Marathon. | Zamykać zamiast usuwać, najlepiej na podstawie heartbeatu `lastSeenAt` aktualizowanego w ticku. |
| F51 | Poprawność | src/modules/activity/index.ts:85-86, :141-188 | Medium | M | Rekonsyliacja tylko zamyka aktywności, nigdy ich nie otwiera. Ktoś, kto wszedł na voice w czasie przestoju, nie zarabia nic, dopóki nie wejdzie ponownie. | W ticku startować aktywność dla każdego wpisu `guild.voiceStates.cache` bez otwartej aktywności. |
| F52 ✅ | Poprawność | src/events/userLeveledUp.ts:21,33; roles/index.ts:268-270 | Medium | S | Rola i ogłoszenie pojawiają się tylko wtedy, gdy `newLevel` **jest** progiem. Przeskok (np. 9→11 po nagrodzie streak) pomija rolę aż do następnego progu. | `thresholds.some(t => t.level > old && t.level <= new)` |
| F53 ⊘ | Integralność danych | src/events/guildMemberRemove.ts:13-16 | Medium | S | Wyjście z serwera na zawsze kasuje całe statystyki, także przy kicku albo przypadkowym wyjściu. Jest to niespójne, bo osiągnięcia i aktywności zostają. | Soft-delete przez pole `leftAt`, wykluczenie z rankingu, usunięcie po N dniach. |
| F54 ⊘ | Nadużycia | src/events/messageCreate.ts:90-99 | Medium | S | EXP za wiadomości nie ma cooldownu. ~75 EXP za wiadomość to tyle co ~9 min na voice, więc spamem można farmić EXP i dzienne rankingi. | Cooldown per user w pamięci (np. 60 s). |
| F55 | Wzrost danych | src/modules/schemas/PresenceActivity.ts; activity/index.ts:411-440 | Medium | S | Kolekcje aktywności nigdy nie są czyszczone, a każde otwarcie strony About agreguje całą historię presence. | Indeks TTL na `to` w kolekcji presence. |
| F56 | Poprawność | src/modules/achievement/achievements/checks.ts:22-28; activity/index.ts:197-211 | Medium | S | Night Owl i Marathon są liczone tylko w handlerach leave, deaf i przejścia na AFK. Sesje zamknięte przez stale sweep, często te długie nocne, nigdy nie są zaliczane. | Sweep zwraca zamknięte dokumenty, a dla każdego wywoływany jest `checkVoiceSessionEnd`. |
| F57 | Poprawność | src/events/voiceChannelSwitch.ts:14-15; voiceChannelUndeaf.ts:12 | Medium | S | Sesje startują też przy undeaf i przy wyjściu z AFK, ale Host i CoordinatedAction są sprawdzane tylko przy join. Jeśli pierwsza sesja dnia zaczęła się przez undeaf, nikt nie dostaje Host. | Wspólne `onVoiceSessionStart()` wywoływane w 3 miejscach. |
| F58 ✅ | Poprawność | src/events/userBackFromLongVoiceBreak.ts:15-17; activity/index.ts:283-285 | Medium | S | Przerwa dla Comeback jest liczona globalnie (ostatnia sesja na dowolnym serwerze), a zapisywana per serwer. Noc spędzona na deaf liczy się jako „powrót”. | Liczyć per `{userId, guildId}` i tylko przy prawdziwym join. |
| F59 | Poprawność | src/modules/achievement/achievements/ghost.ts:20-22 | Medium | S | Ghost jest oceniany w chwili wejścia na kanał. Przy auto-rejoin po starcie Discorda voice-state przychodzi przed presence, więc brak presence jest traktowany jak „offline”. Daje to fałszywe i nieodwracalne odblokowanie. | Opóźnienie ok. 5 s (jak w DJ) i ponowny odczyt presence. |
| F60 | Poprawność | src/modules/achievement/achievements/coordinatedAction.ts:72; activity/index.ts:96 | Medium | S | `from` jest ustawiane dopiero po kilku awaitach, w tym nieindeksowanym sortowaniu. Opóźnienie jest tego samego rzędu co progi 0,5 i 0,25 s, więc poziomy 8–9 są przyznawane losowo. | `new Date()` jako pierwsza linia `voiceChannelJoin.run`, przekazywane dalej. |
| F61 | Poprawność | src/modules/achievement/achievements/marathon.ts:25-26; comeback.ts:24-25; uniqueReactions.ts:48-49 | Medium | S | Osiągnięcia „rekordowe” wychodzą przed `reach()`, gdy nie ma nowego rekordu. Po zmianie progów albo nieudanym `setLevel` użytkownik utyka na starym poziomie. | Zawsze `return this.reach(best)`. |
| F62 ✅ | Pułapka | src/interfaces/AchievementType.ts:4-17 | Medium | S | Wartości enuma są niejawne, a trafiają do Mongo i do kluczy tłumaczeń. Wstawienie albo przestawienie elementu po cichu przemapowuje osiągnięcia wszystkich użytkowników. | Jawne `= 0 … = 11` i komentarz „tylko dopisywać”. |
| F63 | Poprawność | src/modules/ephemeral-channel/index.ts:90,94 | Medium | S | Synchronizacja przy starcie i przy edycji pobiera tylko 50 najnowszych wiadomości, więc starsze wiadomości w ruchliwym kanale nigdy nie zostaną skasowane. | Paginacja `before:` aż do `createdAt` kanału, z limitem stron. |
| F64 | Wydajność | src/modules/ephemeral-channel/index.ts:61-68 | Medium | M | Wiadomości są kasowane pojedynczo. Zaległości po przestoju to minuty rate-limitu, a nakładające się ticki wysyłają duplikaty requestów. | `bulkDelete(ids, true)` per kanał, z fallbackiem dla wiadomości starszych niż 14 dni. |
| F65 | Poprawność | src/modules/messages/notificationsManager.ts:21, :53-58, :72-89 | Medium | S | Jedna flaga `workLastItemInQueueCallbackCalled` obsługuje wszystkie kanały. To, czy worker działa, jest wnioskowane z pustej kolejki, więc na jednym kanale mogą ruszyć dwa workery i pojawiają się podwójne quick buttons. | `Set<channelId>` zarówno dla flagi, jak i dla `running`. |
| F66 ✅ | Poprawność | src/modules/messages/index.ts:254 | Medium | S | Gdy brak roli poziomu, w wiadomości renderuje się `<@&undefined>`. | Osobny klucz tłumaczenia dla braku roli. |
| F67 ✅ | Poprawność | src/modules/messages/index.ts:292-296 | Medium | S | Dla commitów bez powiązanego konta GitHub zwraca `author: null`, więc `commit.author.login` rzuca TypeError. Wiadomość commita nie jest obcinana. | `commit.author?.login ?? commit.commit.author?.name`; pierwsza linia, maks. 200 znaków. |
| F68 | Poprawność | src/modules/messages/index.ts:187-198, :900 | Medium | S | `users.fetch` rzuca zamiast zwrócić null, więc gałąź „nie znaleziono” jest martwa. `channels.fetch(...) as TextChannel` może być null, co kończy się crashem w :901. | `.catch(() => null)`; guard `isTextBased()`. |
| F69 | Architektura | src/modules/achievement/structures/BaseAchievement.ts:4; messages/embeds/index.ts:5 | Medium | S | Realne cykle importów w runtime: `achievement/index` ↔ `structures` (przez `achievementModel`), `messages/index` ↔ `embeds` (przez `getColorInt`), `messages` ↔ `pages`, `roles` i `user`. Działają tylko dlatego, że wartości są używane leniwie; użycie na top-levelu da `undefined`. Pozostałe ~110 z 114 cykli zgłoszonych przez madge to importy używane jako typy. | Przenieść model do `achievement/model.ts`, a kolory do `messages/colors.ts`. Reguła ESLint `consistent-type-imports`, żeby madge pokazywał tylko realne cykle. |
| F70 | Kontrakt | src/modules/messages/index.ts:241, :524, :866-875 | Medium | S | Buildery powiadomień przy błędzie zwracają czerwony embed z błędem, a wywołujący wysyłają go publicznie na kanał. `flags: [4096]` to magiczna liczba powtórzona 6 razy. | Zwracać `null`; `MessageFlags.SuppressNotifications`. |
| F71 | Wydajność | src/modules/messages/index.ts:100-116 | Medium | S | `useImageHex` pobiera i kwantyzuje avatar przy każdym kliknięciu (profil, ranking, `/color`, `/help`), a w ścieżce follow osobno dla każdego obserwującego. | Cache po URL (URL-e avatarów zawierają hash), rozmiar 64. |
| F72 | Wydajność | src/modules/messages/pages/profile/achievements.ts:37-47; statistics.ts:32 | Medium | M | Strona osiągnięć robi 12 równoległych `findOne` na każde kliknięcie. Pozycja w rankingu ładuje cały serwer do Node. | Jeden `find({userId, guildId})`; pozycja przez `countDocuments`. |
| F73 ✅ | Duplikacja | src/interactions/commands/ranking.ts:20-27; buttons/ranking.ts:19-30; contexts/rankingMessageContext.ts:22-33; rankingUserContext.ts:23-32 | Medium | S | Inicjalizacja stanu rankingu jest skopiowana 4 razy i kopie już się rozjechały: `/ranking` zachowuje sortowanie, pozostałe je resetują. | `openRanking()` / `refreshRankingPage()`. |
| F74 | Duplikacja | src/modules/messages/pages/profile/statistics.ts:62-68 (+achievements.ts:131, guildVoiceActivityStreak.ts:75, presenceActivity.ts:70, voiceActivity.ts:61) | Medium | S | 5 identycznych override'ów `BaseProfilePage.embedTitleField`. `voiceActivity.ts` i `presenceActivity.ts` to kopie różniące się jednym polem. | Usunąć override'y; jedna klasa `TimeBreakdownPage(metric)`. |
| F75 | Architektura | src/modules/activity/index.ts:1-654 | Medium | M | 9 odpowiedzialności w jednym pliku: nagrody i powiadomienia, cykl życia aktywności, rekonsyliacja, zapytania, agregaty ticka, statystyki klientów, streak, formatowanie z i18n. | Podział na `voice` / `presence` / `reconcile` / `streak` / `queries` / `format` bez zmiany zachowania. |
| F76 | Testy | — | Medium | M | Brak testów i CI, a krytyczna czysta logika (`expToLevel`, streak, `merge`, `getNightMs`, helpery dat) nie ma żadnej siatki bezpieczeństwa. ESLint nie ma `no-floating-promises`, które złapałoby F18, F31, F42 i F23. | Kilka testów `node:test` dla czystych funkcji (bez frameworka). Włączyć `@typescript-eslint/no-floating-promises` z typed lintingiem. |
| F77 | Typy | src/modules/activity/index.ts:287-347; schemas/UserGuildStatistics.ts:5 | Medium | S | Wyniki agregacji są otypowane jako dokumenty Mongoose, więc `.save()` na nich wysypie się w runtime. `UserGuildStatisticsDocument` krzyżuje się z **DOM-owym** `Document`, bo nie ma importu `Document` z mongoose. `BaseAchievement.achievementType` ma typ `AchievementType` zamiast `T` (:14, :21). | `findOne().sort().lean<T>()`; import `Document` z mongoose; typ `T`. |
| F78 | Bezpieczeństwo | src/interactions/commands/eval.ts:7; src/utils/clean.ts:15 | Low | S | `/eval` jest zarejestrowany globalnie i widoczny dla wszystkich (właściciel jest sprawdzany poprawnie). Wynik nie jest obcinany, a redakcja obejmuje tylko `DISCORD_TOKEN`, więc `MONGO_URI` z hasłem może się wypisać. | `setDefaultMemberPermissions(0)`; redagować wszystkie wartości z `keys`; obcinać wynik. |
| F79 | Deprecated API | src/interactions/commands/color.ts:15 (i ~50 innych) | Low | S | Przestarzałe API discord.js 14.27, które znikną w v15: `ephemeral: true` (51 miejsc), `setDMPermission` (4), `message.interaction` (`messages/index.ts:908`, `selectReroll.ts:11`, `selectMessageDelete.ts:9`, `dj.ts:20`). | `flags: MessageFlags.Ephemeral`, `setContexts`, `interactionMetadata`. |
| F80 | Dokumentacja | README.md:82, :165 | Low | S | README podaje Node 18, Nodemon, `autoPutSlashCommands: true` i `chance: 10`, a pomija `achievements`. Tekst „Fully translated” nie jest prawdą: są zahardkodowane `'Unknown'` i jednostka „H”, a w `roleColorUpdate.ts:14` użytkownik widzi surowy klucz `utils.guildOnly`. Nie ma skryptu deployu komend. | Zsynchronizować README; dodać skrypt npm `deploy-commands`. |
| F81 | Martwy kod | src/interactions/buttons/commits.ts:5 i inne | Low | S | Nieużywane: przycisk `commits` (nic go nie emituje), `Button.permissions` i `Select.permissions` (nieczytane), timer `hourly` bez listenera, 15 eksportów i 6 typów (lista z `knip`). W obu językach jest 23 martwych kluczy tłumaczeń, a 6 kluczy istnieje tylko w en-US i też jest nieużywanych. | Usunąć albo zaimplementować `permissions` w dispatcherze, co przy okazji rozwiązuje F33. |
| F82 | Zależności | package.json | Low | S | Nieużywane: `axios`, `winmojilib`, `ts-node`. `npm audit` zgłasza 5 podatności moderate przez `node-vibrant`. | Usunąć nieużywane zależności. `node-vibrant` zaktualizować, gdy wyjdzie wersja z poprawionym `file-type`. |
| F83 | Poprawność | src/modules/activity/index.ts:621-630 | Low | S | Pierwsza sesja każdego klienta jest liczona podwójnie (`set(s)`, a potem `set(cur + s)`). | `set(c, (get(c) ?? 0) + s)` |
| F84 | Pułapka | src/events/yearly.ts:8; userGuildStatistics.ts:99-101 | Low | S | „Experience wipe” to `deleteMany({})`, które kasuje także liczniki wiadomości, czasu i komend. Obecnie wyłączone (`config.ts:35`). | `updateMany({}, {$set: {"total.exp": 0, level: 0}})` |
| F85 | Spójność | src/utils/date.ts:39-47 vs ~10 miejsc z `Math.round(s/3600)` | Low | S | Czas trwania jest formatowany na dwa sposoby: `2h 14m` po angielsku nawet w PL oraz „H” z zaokrągleniem, przez co sesja poniżej 30 min pokazuje się jako „0H”. | Jeden formatter z obsługą locale. |

---

## Plan indeksów

Przed każdym indeksem **unikalnym** trzeba zrobić deduplikację (`$group` + `$match {n: {$gt: 1}}`): statystyki scalić przez sumowanie, a nadmiarowe otwarte aktywności zamknąć. Inaczej autoIndex Mongoose wywali się przy starcie.

| Kolekcja | Zapytanie (gdzie) | Indeks |
|---|---|---|
| voiceactivities | `{userId, guildId, to: null}`: `activity/index.ts:280`, `social.ts:24`, `suss.ts:27` | `{userId:1, guildId:1, to:1}` + unique partial `{userId:1, guildId:1}` z `{to: {$type: "null"}}` |
| voiceactivities | `{to: null}` co minutę: `activity/index.ts:142, :350` | `{to:1}` |
| voiceactivities | historia użytkownika, sort po `from`: `:444`, `:487` | `{userId:1, guildId:1, from:-1}` |
| voiceactivities | kanał: `coordinatedAction.ts:67`, `social.ts:28`, `streamer.ts:30`, `suss.ts:28` | `{guildId:1, channelId:1, to:1}` |
| voiceactivities | Host: `host.ts:23` | `{guildId:1, from:-1}` |
| presenceactivities | `{userId, guildId, to: null}` przy każdym `presenceUpdate`: `:308` | jak dla voice + unique partial |
| presenceactivities | `{to: null}`: `:214`, `:381` | `{to:1}` z `expireAfterSeconds` (TTL, F55) |
| usergamestatistics* | `{userId, guildId}`: `userGuildStatistics.ts:26` | **unique** `{userId:1, guildId:1}` |
| usergamestatistics* | ranking `{guildId}` sort `total.exp` | `{guildId:1, "total.exp":-1}` |
| users | `{userId}` + `$lookup` | **unique** `{userId:1}` |
| guilds | `{guildId}` (prawie każdy event) | **unique** `{guildId:1}` |
| follows | `{sourceUserId, targetUserId}`, `{targetUserId}` | **unique** `{sourceUserId:1, targetUserId:1}`; `{targetUserId:1}` |
| achievements | `{userId, guildId, achievementType}` | **unique** `{userId:1, guildId:1, achievementType:1}` |
| messages | `{channelId, typeId, targetUserId}`, `{messageId}` | `{channelId:1, typeId:1, targetUserId:1}`; `{messageId:1}`; dodać `timestamps: true` (sort po `createdAt` odwołuje się dziś do pola, które nie istnieje) |

\* nazwa kolekcji modelu `UserGuildStatistics`.

---

## Top 5: jeśli nic innego, to to

### 1. ✅ Wyłączyć niszczenie ról (F01, F03)

Wdrożone jako rozpoznawanie ról po ID zamiast nazwy; szczegóły w sekcji [Status wdrożenia](#status-wdrożenia-2026-10-06). Pierwotna propozycja, czyli dopasowanie dokładnie do „Level N”, została odrzucona, bo personalizacja nazw ról poziomu była zamierzona.

### 2. Produkcja, która się podnosi i nie wynosi sekretów (F02, F04, F11)

```
# .dockerignore (nowy plik)
.env*
.agent-office
.git
.idea
node_modules
```

```dockerfile
FROM node:22-slim
ENV TZ=Europe/Warsaw NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
CMD ["npx", "tsx", "src"]
```

(`tsx` trzeba przenieść z devDependencies do dependencies albo użyć `node --import tsx src`.)

```ts
// src/process.ts
process.on("uncaughtException", (err) => { console.error("[Uncaught Exception]", err); process.exit(1); });
// src/modules/timers.ts:47
cron.schedule(schedule.cron, () => client.emit(schedule.name), { timezone: "Europe/Warsaw" });
```

Uruchamiać z `docker run --restart unless-stopped --env-file .env …`. **Jeśli obraz był gdzieś wypychany, zrotuj token Discorda i hasło do Mongo.**

### 3. Locale per żądanie (F05, F46)

`src/client/i18n.ts` zachowuje ten sam default export, więc ~170 wywołań się nie zmienia:

```ts
import { AsyncLocalStorage } from "node:async_hooks";
i18n.configure({ ..., updateFiles: false, retryInDefaultLocale: true });
const als = new AsyncLocalStorage<{ locale: string }>();
const norm = (l?: string | null) => (l && localeList.includes(l) ? l : "en-US");
const cur = () => als.getStore()?.locale ?? "en-US";
export const withLocale = <T>(l: string | null | undefined, fn: () => T) => als.run({ locale: norm(l) }, fn);
export default {
    setLocale: (l?: string | null) => { const s = als.getStore(); if (s) s.locale = norm(l); },
    __:   (p: string, ...a: string[]) => i18n.__({ phrase: p, locale: cur() }, ...a),
    __mf: (p: string, params?: object) => i18n.__mf({ phrase: p, locale: cur() }, params),
    __n:  (k: string, n: number) => i18n.__n({ singular: k, plural: k, locale: cur() }, n),
};
```

```ts
// ExtendedClient.ts:55 — każdy event dostaje własny scope
this.on(event.name, (...args) => withLocale("en-US", () => event.run(this, ...args)
    .catch((e: unknown) => console.error(`[event:${event.name}]`, e))));   // + F41
```

Istniejące `i18n.setLocale(...)` w `interactionCreate` i w builderach działają od tej pory wewnątrz izolowanego scope'u.

### 4. Integralność danych (F06–F08, F19, F20, F28)

Kolejność: **deduplikacja → indeksy → atomowe zapisy.**

```ts
// userGuildStatistics.ts — zamiast findOne/merge/save
const BUCKETS = ["total", "day", "week", "month"] as const;
const toInc = (u: DeepPartial<UserStatistics>) => {
    const inc: Record<string, number> = {};
    for (const b of BUCKETS) {
        if (u.exp) inc[`${b}.exp`] = u.exp;
        if (u.messages) inc[`${b}.messages`] = u.messages;
        if (u.commands) inc[`${b}.commands`] = u.commands;
        if (u.time?.voice) inc[`${b}.time.voice`] = u.time.voice;
        if (u.time?.presence) inc[`${b}.time.presence`] = u.time.presence;
    }
    return inc;
};
export const updateUserGuildStatistics = async ({ client, userId, guildId, update }) => {
    const doc = await UserGuildStatisticsModel.findOneAndUpdate(
        { userId, guildId }, { $inc: toInc(update) },
        { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
    const newLevel = expToLevel(doc.total.exp);
    if (newLevel > doc.level) {
        const r = await UserGuildStatisticsModel.updateOne({ _id: doc._id, level: doc.level }, { $set: { level: newLevel } });
        if (r.modifiedCount) client.emit("userLeveledUp", userId, guildId, doc.level, newLevel);
    }
    return doc;
};
```

```ts
// schemas/VoiceActivity.ts i PresenceActivity.ts
schema.index({ userId: 1, guildId: 1 }, { unique: true, partialFilterExpression: { to: { $type: "null" } } });
// start*Activity: catch (e) { if (e?.code === 11000) return get*Activity(userId, guildId); throw e; }
```

```ts
// AchievementManager.ts — checki jednego (user, guild, typ) wykonywane po kolei
// ponytail: kolejka w pamięci, wystarcza póki bot to jeden proces
const tails = new Map<string, Promise<unknown>>();
const serialized = <T>(key: string, task: () => Promise<T>): Promise<T> => {
    const run = (tails.get(key) ?? Promise.resolve()).then(task, task);
    const tail = run.catch(() => {});
    tails.set(key, tail);
    tail.then(() => { if (tails.get(key) === tail) tails.delete(key); });
    return run;
};
```

### 5. Centralny dispatcher interakcji i stan w customId (F14–F18)

```ts
// interactionCreate.ts
async function safely(i: RepliableInteraction, label: string, fn: () => Promise<void>) {
    try { await fn(); }
    catch (e) {
        console.error(`[interaction:${label}] user=${i.user.id} guild=${i.guildId}`, e);
        const p = { ...getErrorMessagePayload(), flags: MessageFlags.Ephemeral };
        await (i.deferred || i.replied ? i.followUp(p) : i.reply(p)).catch(() => {});
    }
}
const [id, ...args] = interaction.customId.split(":");
const handler = client.buttons.get(id);
if (!handler) return interaction.reply({ content: i18n.__("utils.expired"), flags: MessageFlags.Ephemeral });
await safely(interaction, `button:${id}`, () => handler.run(client, interaction, ...args));
```

Następnie przycisk follow emituje `profileFollow:<targetId>`, a handler czyta cel z `args[0]` (fallback do store dla wiadomości wysłanych przed wdrożeniem). Plus jednolinijkowe poprawki F14 (`&& p.visible`) i F15 (`sourceUser`).

**Podział `messages/index.ts` (F32)** robić po Top 5, z barrelem w `index.ts`, w kolejności od zmian bez wpływu na zachowanie:

| Plik | Linie | Uwagi |
|---|---|---|
| `colors.ts` | 93-120 | Rozwiązuje cykl `embeds` (F69). |
| `formatters.ts` | 972-981 | |
| `tracking.ts` | 98, 928-970 | Plus `fetchTrackedMessage` (F27). |
| `channelMaintenance.ts` | 877-926 | |
| `payloads/notifications.ts` | 236-278, 482-563, 759-864 | Zwracają `null` przy błędzie. |
| `payloads/{profile,ranking,config,color,select,info,eval}.ts` | reszta | |

`npx tsc --noEmit` po każdym przeniesieniu.

---

## Quick wins (S × Medium+)

- [x] F01 / F03: role poziomu i koloru rozpoznawane po ID
- [x] F02: `.dockerignore`
- [x] F04: `uncaughtException` → `exit(1)`, CMD bez `watch` (SIGTERM jeszcze nie)
- [x] F11: `{ timezone: "Europe/Warsaw" }` w `timers.ts` i `TZ` w Dockerfile
- [x] F13: zamienić kolejność `createGuild` / `setDefaultChannelId`
- [x] F14: `&& p.visible` w `getPageByType`
- [x] F15: `sourceUser.userId` w `achievements.ts` (3 linie)
- [x] F17: `ChannelSelectMenuBuilder` w `/config`
- [x] F21: filtr botów w `AchievementManager.check`
- [x] F23: `.catch(() => null)` w `fetchReferenceMessage`
- [x] F24: `message.pinned` przed delete + event `messagePinned`
- [x] F25: trwałe błędy delete usuwają wiadomość z cache
- [x] F26: `bulkDelete` + `allSettled` w sweepie
- [x] F27: `fetchTrackedMessage` usuwa nieaktualny dokument
- [x] F31: role tworzone przed masowym przydziałem, błędy logowane
- [x] F35: usunąć `voiceChannelSwitch.ts:18`
- [x] F38 / F39: `guildCreate` bez fałszywego wyjścia; `showModal` bez zbędnego pobierania avatara
- [x] F41: wrapper `.catch` z nazwą eventu
- [x] F46: `updateFiles: false, retryInDefaultLocale: true`
- [x] F52: przeskoki progów ról poziomu
- [ ] F54: cooldown EXP za wiadomości (decyzja: zmienia ekonomię gry)
- [x] F62: jawne wartości `AchievementType`
- [x] F66 / F67: `<@&undefined>` i `commit.author?.login`

---

## Co dodać

Pomysły oparte na danych, które bot **już zbiera**, albo na funkcjach zbudowanych w połowie.

**Statystyki i zaangażowanie**
- **Podsumowanie tygodnia i miesiąca:** snapshot top N przed `clearTemporaryStatistics` (`userGuildStatistics.ts:236`) i post w `events/weekly.ts`. Daje też „zmianę tydzień do tygodnia” na profilu.
- **Heatmapa aktywności:** godzina × dzień tygodnia w czasie warszawskim, z `VoiceActivity.from/to` przez `$dateToString` z timezone.
- **„Najlepszy kompan voice”:** osoba, z którą najdłużej siedzisz na tym samym kanale. Social już śledzi, kogo spotkałeś (`social.ts:28`).
- **Przypomnienie „streak zagrożony”:** wieczorny DM przy streaku ≥ 3, jeśli nie było sesji danego dnia; po naprawie F49.
- **Pasek postępu poziomu i EXP do następnego** na stronie Statistics (`experiencePercentage` już istnieje, `statistics.ts:34`).
- **Ranking:** przycisk „Skocz do mnie” (`findUserRankingPage` istnieje) i własny wiersz w stopce, gdy jesteś poza bieżącą stroną.
- **Strona „Porównaj ze mną”:** `ProfilePagePayloadParams` ma już `sourceUser` i `renderedUser`.

**Osiągnięcia** (dane już są)
- **Early Bird** (voice 05:00–08:00): uogólnić `getNightMs` w `nightOwl.ts`.
- **Dedicated** (najdłuższy streak): `maxStreak` jest liczony w `activity/index.ts:442`.
- **Full House** (najwięcej osób na kanale z tobą): `checkVoiceChannelMembers` ma już listę członków.
- **Chatterbox** (wiadomości łącznie): `total.messages` już istnieje.
- **Rzadkość osiągnięcia** („ma je 12% członków”): jedna agregacja w `AchievementManager.getAll`.

**UX i administracja**
- **`/profile [user]` jako slash command:** dziś profil jest dostępny tylko z menu kontekstowego, które na mobile jest trudno dostępne.
- **Lista obserwowanych i unfollow:** `getFollowing` (`follow/index.ts:28`) istnieje, ale nikt go nie używa.
- **Osobne przełączniki powiadomień w `/config`** (level-up, daily, streak, osiągnięcia) zamiast jednego.
- **Digest powiadomień:** `NotificationsManager` już kolejkuje per kanał, więc może scalać do 10 embedów w jedną wiadomość. Mniej pingów.
- **Handler `guildDelete`:** zamyka aktywności i porządkuje dane; `deleteGuild` istnieje, ale jest martwy.
- **Skrypt `deploy-commands`:** zastępuje przełączanie `autoPutSlashCommands`.
- **`/ephemeral-channel status`** (ile wiadomości czeka) i **wykluczenia ról lub botów**.
- **Podgląd (dry-run) ról poziomu** przed synchronizacją (`roles/index.ts:170`).
- **Deklaratywne `permissions` w przyciskach i selectach:** pole istnieje w interfejsach, dispatcher go nie czyta.

---

## Wygląda źle, ale jest OK

- **`new AchievementManager(...).check(...)` bez `await`** w eventach. `check()` ma własny `.catch` (`AchievementManager.ts:39-45`), więc fire-and-forget jest tu zamierzony i bezpieczny. Problemem są wyścigi między checkami (F19), nie brak `await`.
- **`merge()` w `updateUserGuildStatistics` wygląda jak nadpisywanie,** ale `utils/merge.ts:9` sumuje liczby. Logika jest poprawna; problem leży wyłącznie w atomowości (F06).
- **Magiczna liczba `395405552720`** (`guildCreate.ts:15`) to dokładnie 13 uprawnień z `getInvite()`. Lepiej wyprowadzić jedno z drugiego, ale dziś jest to poprawne.
- **Moduły, w tym Mongo, startują w `clientReady`, już po podpięciu eventów.** Mongoose buforuje komendy do czasu połączenia, więc wczesne eventy nie padają.
- **Sprawdzenie właściciela przy `/eval`.** `interaction.user.id` nie da się podrobić, a `keys.ts` rzuca przy starcie, gdy brakuje `OWNER_ID`.
- **`closeStaleVoiceActivities` ufa cache voice-state.** Z intentem GuildVoiceStates ten cache jest utrzymywany przez gateway i autorytatywny.
- **`time.voice: voice ? 60 : 0`** (`ExperienceUpdater.ts:160`). Ten cap jest nośny: duplikaty aktywności zawyżają EXP, ale nie czas.
- **`checkVoiceActivityRewards` patrzy tylko na zamknięte aktywności** (`to: {$ne: null}`). Też nośne: świeżo otwarta aktywność musi być wykluczona, inaczej każde wejście wyglądałoby na „już aktywny dziś”.
- **`expToLevel` przez `exp(log(x)/3)` z `floor`.** Przesymulowane dla poziomów 1–250, nie ma off-by-one.
- **Rekurencja w `getRandomGaussian`.** Przy σ = 0,1 szansa na wyjście poza zakres to ~6e-7, więc nie ma ryzyka przepełnienia stosu.
- **`JSON.parse(JSON.stringify(...))` w `presence.ts:61`.** Jest konieczne, bo `replacePlaceholders` mutuje obiekt; bez kopii placeholdery zostałyby podmienione na stałe w module.
- **Nowe instancje osiągnięć przy każdym checku.** Wymagane, bo `direct()` mutuje instancję.
- **`nightOwl.ts` iteruje po godzinach UTC.** Przesunięcia Warszawy to pełne godziny, więc granice się pokrywają.
- **Pojedyncze `message.delete()` zamiast `bulkDelete` w ephemeral.** `bulkDelete` nie usunie wiadomości starszych niż 14 dni (po długim przestoju), więc docelowo potrzebna jest hybryda (F64), a nie zamiana.
- **Guard `if (!member.voice.channel) return` w `voiceChannelUndeaf.ts:10`.** discord-logs emituje undeaf także przy wyjściu z kanału, a ten guard blokuje fantomowe sesje.
- **Globalny `moment.locale("pl-PL")`.** Wszystkie formaty są numeryczne, więc polskie słowa nie wyciekają do anglojęzycznych użytkowników; jedyny efekt to tydzień od poniedziałku.
- **Klucz `rankingSortings.label.voice time` ze spacją.** `objectNotation` dzieli tylko po kropce, a klucz istnieje w obu językach.
- **Kolejka `NotificationsManager`.** Zawsze się opróżnia, bo każda iteracja robi `shift` i wszystko jest w try/catch. Realne problemy to tylko flagi i podwójny worker (F65).
- **`npm audit` (file-type).** Podatność dotyczy parsera ASF, a avatary Discorda to PNG/GIF/WebP.
- **Komentarze `ponytail:`.** Oznaczają świadome skróty i nie są długiem samym w sobie.

---

## Pytania otwarte

1. **EXP nadliniowe (F10):** czy nagradzanie długich sesji rosnącą stawką jest zamierzone? Jakie limity są akceptowalne?
2. **Wyjście z serwera kasuje statystyki (F53):** zamierzone? Czy powrót powinien je przywracać?
3. **Prywatne statystyki czasu** ukrywają tylko ranking `total` (`userGuildStatistics.ts:124, :197`). Czy osoby prywatne mają być widoczne w rankingach day/week/month?
4. **Deaf i AFK:** czy wyciszeni mają się liczyć jako obecni (sweep pustego kanału F36, dzielenie sesji Marathon, reset Suss)?
5. **Sweep:** czy kasowanie ludzkich wiadomości zaczynających się od `(`, `)`, `/` jest zamierzone? Kto powinien móc sweepować (F33)?
6. **Follow:** globalny czy per serwer (F34)? DM w języku osoby obserwowanej czy obserwującej?
7. **Comeback:** per serwer (jak jest zapisywany) czy globalnie (jak jest liczony) (F58)?
8. **Czy obraz Dockera był gdzieś wypychany?** Jeśli tak, trzeba zrotować token i hasło do Mongo (F02).
9. **Rozmiary kolekcji i istniejące duplikaty:** od tego zależy krok deduplikacji przed indeksami unikalnymi.
10. **Zmiana customId (F16):** przyciski na już wysłanych wiadomościach przestaną działać, chyba że stare ID zostaną jako aliasy. Akceptowalne?
11. **Czy bot zawsze działa jako jeden proces?** Singletony, stores i proponowana kolejka osiągnięć tak zakładają.
12. **Promocyjne powiadomienie z zaproszeniem** (15% szans przy ostatnim elemencie kolejki): nadal chciane na każdym serwerze?
13. **Zasady osiągnięć:** Streamer liczy tylko wtedy, gdy ktoś był obecny na starcie streamu; CoordinatedAction nagradza tylko drugą osobę. Celowo?
14. **Ephemeral (`index.ts:127-129`):** odpowiedź na zachowaną wiadomość jest zachowywana, *chyba że* autor odpowiedzi jest autorem zachowanej wiadomości. Czy ta logika nie jest odwrócona?
15. **Hotlinki imgur i singlecolorimage.com** (`knownLinks.ts`, `messages/index.ts:377`): przenieść do własnego hostingu?
