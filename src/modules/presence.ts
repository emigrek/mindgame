import ExtendedClient from "@/client/ExtendedClient";
import { Module } from "@/interfaces";
import presencesData from "@/modules/presence/presences.json";
import { ActivitiesOptions, PresenceData } from "discord.js";
import { getRandomEmojiFromGroup, Groups } from "winemoji";

const replacePlaceholders = async (
  client: ExtendedClient,
  activity: ActivitiesOptions
) => {
  if (!activity.name) return activity;

  const { users, guilds } = await client.experienceUpdater.getLogDetails();

  activity.name = activity.name
    .replace(/{guilds}/g, client.numberFormat.format(guilds))
    .replace(/{users}/g, client.numberFormat.format(users))
    .replace(
      /{animalsAndNatureEmoji}/g,
      getRandomEmojiFromGroup(Groups.AnimalsAndNature).char
    );

  return activity;
};

export const updatePresence = async (client: ExtendedClient) => {
  const presences: PresenceData[] = JSON.parse(JSON.stringify(presencesData));
  const random = presences[Math.floor(Math.random() * presences.length)];

  random.activities = await Promise.all(
    random.activities?.map((activity: ActivitiesOptions) =>
      replacePlaceholders(client, activity)
    ) ?? []
  );

  client.user?.setPresence(random);
};

export const presence: Module = {
  name: "presence",
  run: async (client) => {
    await updatePresence(client);
  },
};
