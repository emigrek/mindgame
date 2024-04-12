import {ActivitiesOptions, PresenceData} from "discord.js";
import ExtendedClient from "@/client/ExtendedClient";
import {getRandomEmojiFromGroup, Groups} from "winemoji";

import presencesData from "./presences.json";

const replacePlaceholders = (client: ExtendedClient, activity: ActivitiesOptions) => {
    if (!activity.name) return activity;

    const { users, guilds } = client.experienceUpdater.getLogDetails();

    activity.name = activity.name
        .replace(/{guilds}/g, client.numberFormat.format(guilds))
        .replace(/{users}/g, client.numberFormat.format(users))
        .replace(
            /{animalsAndNatureEmoji}/g, getRandomEmojiFromGroup(Groups.AnimalsAndNature).char
        );

    return activity;
};

const updatePresence = async (client: ExtendedClient) => {
    const presences: PresenceData[] = JSON.parse(JSON.stringify(presencesData));
    const random = presences[Math.floor(Math.random() * presences.length)];

    random.activities = random.activities?.map((activity: ActivitiesOptions) =>
        replacePlaceholders(client, activity)
    );

    client.user?.setPresence(random);
}

export { updatePresence };