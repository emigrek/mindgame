import { GuildMember } from "discord.js";
import ExtendedClient from "../client/ExtendedClient";
import { Event } from "../interfaces";
import { getLastVoiceActivity } from "../modules/activity";
import { getFollowers } from "../modules/follow";
import { getFollowMessagePayload } from "../modules/messages";
import { getUser } from "../modules/user";

export const userBackFromLongVoiceBreak: Event = {
    name: "userBackFromLongVoiceBreak",
    run: async (client: ExtendedClient, member: GuildMember) => {
        const sourceUser = await getUser(member.user);
        if(!sourceUser) return;

        const followers = await getFollowers(member.user.id);
        if(!followers) return;

        const lastActivity = await getLastVoiceActivity(member);
        if(!lastActivity) return;

        const followNotifications = followers.map(async (follower) => {
            const followMessage = await getFollowMessagePayload(client, member, lastActivity);
            const followerUser = await client.users.fetch(follower.sourceUserId);
            await followerUser.send(followMessage);
        });

        await Promise.all(followNotifications)
            .catch(error => {
                console.log("Error while sending follow message: ", error);
            });
    }
}