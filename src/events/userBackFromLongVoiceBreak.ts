import ExtendedClient from "@/client/ExtendedClient";
import {Event} from "@/interfaces";
import {AchievementManager} from "@/modules/achievement";
import {Comeback} from "@/modules/achievement/achievements";
import {getLastVoiceActivity} from "@/modules/activity";
import {getFollowers} from "@/modules/follow";
import {getFollowMessagePayload} from "@/modules/messages";
import {getUser} from "@/modules/user";
import {GuildMember} from "discord.js";

export const userBackFromLongVoiceBreak: Event = {
    name: "userBackFromLongVoiceBreak",
    run: async (client: ExtendedClient, member: GuildMember, breakMs?: number) => {
        // breakMs is missing on the very first voice activity
        if (breakMs)
            new AchievementManager({ client, userId: member.id, guildId: member.guild.id })
                .check(new Comeback({ breakMs }));

        const sourceUser = await getUser(member.user);
        if(!sourceUser) return;

        const followers = await getFollowers(member.user.id);
        if(!followers) return;

        const lastActivity = await getLastVoiceActivity(member.user.id);
        if(!lastActivity) return;

        const followNotifications = followers.map(async (follower) => {
            const followMessage = await getFollowMessagePayload(client, member, lastActivity);
            const followerUser = await client.users.fetch(follower.sourceUserId);
            return followerUser.send(followMessage);
        });

        await Promise.all(followNotifications)
            .catch(error => {
                console.log("Error while sending follow message: ", error);
            });
    }
}