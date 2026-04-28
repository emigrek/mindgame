import ExtendedClient from "@/client/ExtendedClient";
import { Module } from "@/interfaces";
import presencesData from "@/modules/presence/presences.json";
import { getMoonEmoji, getSeasonEmoji, getZodiacEmoji } from "@/utils/zodiac";
import { ActivitiesOptions, PresenceData } from "discord.js";
import SunCalc from "suncalc";
import { getRandomEmojiFromGroup, Groups } from "winemoji";

const POLAND_CENTER_COORDINATES = {
  latitude: 52.0693,
  longitude: 19.4793,
};

const warsawTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Warsaw",
});

const getSunPlaceholders = (date: Date) => {
  const { sunrise, sunset } = SunCalc.getTimes(
    date,
    POLAND_CENTER_COORDINATES.latitude,
    POLAND_CENTER_COORDINATES.longitude,
  );

  return {
    sunrise: warsawTimeFormatter.format(sunrise),
    sunset: warsawTimeFormatter.format(sunset),
  };
};

const replacePlaceholders = async (
  client: ExtendedClient,
  activity: ActivitiesOptions,
) => {
  if (!activity.name) return activity;

  const { users, guilds } = await client.experienceUpdater.getLogDetails();
  const now = new Date();
  const { sunrise, sunset } = getSunPlaceholders(now);

  activity.name = activity.name
    .replace(/{guilds}/g, client.numberFormat.format(guilds))
    .replace(/{users}/g, client.numberFormat.format(users))
    .replace(/{sunrise}/g, sunrise)
    .replace(/{sunset}/g, sunset)
    .replace(
      /{animalsAndNatureEmoji}/g,
      getRandomEmojiFromGroup(Groups.AnimalsAndNature).char,
    )
    .replace(/{zodiac}/g, getZodiacEmoji(now))
    .replace(/{moon}/g, getMoonEmoji(now))
    .replace(/{season}/g, getSeasonEmoji(now));

  return activity;
};

export const updatePresence = async (client: ExtendedClient) => {
  const presences: PresenceData[] = JSON.parse(JSON.stringify(presencesData));
  const random = presences[Math.floor(Math.random() * presences.length)];

  random.activities = await Promise.all(
    random.activities?.map((activity: ActivitiesOptions) =>
      replacePlaceholders(client, activity),
    ) ?? [],
  );

  client.user?.setPresence(random);
};

export const presence: Module = {
  name: "presence",
  run: async (client) => {
    await updatePresence(client);
  },
};
