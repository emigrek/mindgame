import { GuildMember } from "discord.js";
import moment from "moment";
import ExtendedClient from "../client/ExtendedClient";
import { Event } from "../interfaces";
import { getLastVoiceActivity } from "../modules/activity";
import { getFollowers } from "../modules/follow";
import { getColorInt, getFollowMessagePayload, useImageHex } from "../modules/messages";
import { getUser } from "../modules/user";
import { withGuildLocale } from "../modules/locale";

export const userBackFromLongVoiceBreak: Event = {
    name: "userBackFromLongVoiceBreak",
    run: async (client: ExtendedClient, member: GuildMember) => {
        await withGuildLocale(client, member.guild);

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