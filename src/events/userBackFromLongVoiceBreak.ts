import {Event} from "@/interfaces";
import {getLastVoiceActivity} from "@/modules/activity";
import {getFollowers} from "@/modules/follow";
import {getFollowMessagePayload} from "@/modules/messages";
import {getUser} from "@/modules/user";

export const userBackFromLongVoiceBreak: Event<"userBackFromLongVoiceBreak"> = {
    name: "userBackFromLongVoiceBreak",
    // Notifies followers; the Comeback achievement is checked per guild in voiceChannelJoin
    run: async (client, member) => {
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