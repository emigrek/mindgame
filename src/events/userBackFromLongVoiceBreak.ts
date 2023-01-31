import { GuildMember } from "discord.js";
import ExtendedClient from "../client/ExtendedClient";
import { Event } from "../interfaces";
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

        for(const follower of followers) {
            const avatar = member.user.displayAvatarURL({ extension: "png", size: 256 });
            const imageHex = await useImageHex(avatar);
            const color = getColorInt(imageHex.Vibrant);
            const embed = {
                color: color,
                author: {
                    name: member.user.tag
                },
                title: client.i18n.__mf("follow.followNotificationTitle", { name: member.guild.name }),
                footer: {
                    text: client.i18n.__("follow.followNotificationFooter"),
                },
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