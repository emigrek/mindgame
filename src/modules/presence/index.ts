import { ActivityType, Client } from "discord.js";
import { getGuilds } from "../guild";

const updatePresence = async (client: Client) => {
    const guilds = await getGuilds();

    client.user?.setPresence({
        activities: [
            {
                name: `${guilds.length}👨‍👩‍👧‍👦 guilds.`,
                type: ActivityType.Watching
            }
        ]
    });
}

export { updatePresence };