import { Event } from "@/interfaces";
import { AchievementManager } from "@/modules/achievement";
import { Streamer } from "@/modules/achievement/achievements";
import { getVoiceActivity } from "@/modules/activity";

export const voiceStreamingStop: Event<"voiceStreamingStop"> = {
    name: "voiceStreamingStop",
    run: async (client, member) => {
        const voiceActivity = await getVoiceActivity({ userId: member.id, guildId: member.guild.id });
        if (voiceActivity) {
            voiceActivity.streaming = false;
            await voiceActivity.save();
        }

        new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
            .check(new Streamer({ member, streaming: false }));
    }
}