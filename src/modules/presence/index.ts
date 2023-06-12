import { ActivitiesOptions, PresenceData } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";
import { Guild as DatabaseGuild } from "../../interfaces";
import { getGuilds } from "../guild";
import { getUsers } from "../user";
import presencesData from "./presences.json";

const replacePlaceholders = async (activity: ActivitiesOptions, guilds: DatabaseGuild[]) => {
    const users = await getUsers();

    const guildCount = guilds.length;
    const userCount = users.length;

    const name = activity.name!
        .replace(/{guilds}/g, guildCount.toString())
        .replace(/{users}/g, userCount.toString());

    
    activity.name = name;

    return activity;
};

const generatePresence = async (client: ExtendedClient, guilds: DatabaseGuild[]) => {
    const presences: PresenceData[] = JSON.parse(JSON.stringify(presencesData));
    const random = presences[Math.floor(Math.random() * presences.length)];
    
    if(random.activities) {
        random.activities = await Promise.all(random.activities.map(async (activity: ActivitiesOptions) => {
            return await replacePlaceholders(activity, guilds);
        }));
    }
    
    await client.user?.setPresence(random);
};

const updatePresence = async (client: ExtendedClient) => {
    const guilds = await getGuilds();
    await generatePresence(client, guilds);
}

export { updatePresence };