import { GuildMember } from "discord.js";
import moment from "moment";
import ExtendedClient from "../client/ExtendedClient";
import { Event } from "../interfaces";
import { getLastVoiceActivity } from "../modules/activity";
import { getFollowers } from "../modules/follow";
import { getColorInt, useImageHex } from "../modules/messages";
import { getUser } from "../modules/user";

export const userBackFromLongVoiceBreak: Event = {
    name: "userBackFromLongVoiceBreak",
    run: async (client: ExtendedClient, member: GuildMember) => {
        const sourceUser = await getUser(member.user);
        if(!sourceUser) return;

        const followers = await getFollowers(member.user.id);
        if(!followers) return;

        const lastActivity = await getLastVoiceActivity(member);
        const unix = lastActivity ? moment(lastActivity.to).unix() : 0;

        for(const follower of followers) {
            const avatar = member.user.displayAvatarURL({ extension: "png", size: 256 });
            const imageHex = await useImageHex(avatar);
            const color = getColorInt(imageHex.Vibrant);
            const embed = {
                color: color,
                author: {
                    name: member.guild.name,
                    icon_url: member.guild.iconURL({ extension: "png", size: 256 })!,
                    url: `https://discord.com/channels/${member.guild.id}/${member.voice.channelId}`
                },
                title: client.i18n.__mf("follow.followNotificationTitle", { name: member.guild.name, tag: member.user.tag }),
                description: client.i18n.__mf("follow.followNotificationDescription", { time: unix }),
                thumbnail: {
                    url: avatar
                }
            }
            const followerUser = await client.users.fetch(follower.sourceUserId);
            if(!followerUser) continue;

            await followerUser.send({ embeds: [embed] });
        }
    }
}