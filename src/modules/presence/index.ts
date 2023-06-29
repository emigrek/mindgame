import { ActivitiesOptions, PresenceData } from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";
import { getGuilds } from "@/modules/guild";
import { getUsers } from "@/modules/user";
import { getRandomEmojiFromGroup } from "@/utils/emojis";

import presencesData from "./presences.json";

interface PlaceholdersData {
    guilds: number;
    users: number;
}

const getPlaceholdersData = async (): Promise<PlaceholdersData> => {
    const guilds = await getGuilds();
    const users = await getUsers();

    return {
        guilds: guilds.length,
        users: users.length
    };
};

const replacePlaceholders = (activity: ActivitiesOptions, data: PlaceholdersData) => {
    const { guilds, users } = data;

    activity.name = activity.name!
        .replace(/{guilds}/g, guilds.toString())
        .replace(/{users}/g, users.toString())
        .replace(/{animal}/g, getRandomEmojiFromGroup("Animals & Nature").char)

    return activity;
};

const updatePresence = async (client: ExtendedClient) => {
    const presences: PresenceData[] = JSON.parse(JSON.stringify(presencesData));
    const random = presences[Math.floor(Math.random() * presences.length)];

    const placeholders = await getPlaceholdersData();

    random.activities = random.activities?.map((activity: ActivitiesOptions) =>
        replacePlaceholders(activity, placeholders)
    );

    client.user?.setPresence(random);
}

export { updatePresence };