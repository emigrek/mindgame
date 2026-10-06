import { Module } from "@/interfaces";
import { checkVoiceSessionEnd } from "@/modules/achievement/achievements";
import { validatePresenceActivities, validateVoiceActivities } from "@/modules/activity";

export const activities: Module = {
    name: "activities",
    run: async (client) => {
        const { outOfSync, closed } = await validateVoiceActivities(client);
        if (outOfSync.length)
            console.log(`Detected ${outOfSync.length} voice activities out of sync with database.`);
        // Sessions that ended while the bot was offline still count for Night Owl and Marathon
        closed.forEach(activity => checkVoiceSessionEnd(client, activity, activity));

        await validatePresenceActivities(client)
            .then((outOfSync) => {
                if(!outOfSync.length) return;
                console.log(`Detected ${outOfSync.length} presence activities out of sync with database.`);
            });
    }
}   