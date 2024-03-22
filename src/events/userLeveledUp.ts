import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { getGuild } from "@/modules/guild";
import { createMessage, getLevelUpMessagePayload, getMessage } from "@/modules/messages";
import { assignUserLevelRole } from "@/modules/roles";
import { sendNewFeaturesMessage } from "@/modules/user";
import { TextChannel } from "discord.js";

export const userLeveledUp: Event = {
    name: "userLeveledUp",
    run: async (client: ExtendedClient, userId: string, guildId: string, oldLevel: number, newLevel: number) => {
        const sourceGuild = await getGuild(guildId);
        if (!sourceGuild) return;

        await sendNewFeaturesMessage({ client, userId, guildId, oldLevel, newLevel })
            .catch(err => console.log("Error while sending new features message: ", err));

        const { notifications, channelId, levelRoles } = sourceGuild;
        if (levelRoles) {
            await assignUserLevelRole({ client, userId, guildId });
        }
        
        if (!notifications || !channelId) return;

        const guild = await client.guilds.fetch(guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId) as TextChannel;
        if (!channel) return;

        const user = await client.users.fetch(userId);
        const levelUpMessagePayload = await getLevelUpMessagePayload(client, user, guild);

        const existing = await getMessage({
            channelId: channel.id,
            targetUserId: user.id,
            name: "levelUpMessage"
        });

        if (existing) {
            const message = await channel.messages.fetch(existing.messageId);
            await message.edit(levelUpMessagePayload)
                .catch(error => {
                    console.log("Error while editing level up message: ", error);
                });
            return;
        }

        await channel.send(levelUpMessagePayload)
            .then(async message => {
                await message.react("🎉");
                await createMessage(message, user.id, "levelUpMessage");
            })
            .catch(error => {
                console.log("Error while sending level up message: ", error);
            });
        // const user = await getUser()
        // const sourceGuilds = await getGuilds();

        // await sendNewFeaturesMessage(client, user, sourceGuild, oldLevel, newLevel)
        //     .catch(err => console.log("Error while sending new features message: ", err));

        // for await (const sG of sourceGuilds) {
        //     const guild = client.guilds.cache.get(sG.guildId);
        //     const { notifications, channelId, levelRoles } = sG;

        //     if (!guild) continue;

        //     if (levelRoles)
        //         await assignUserLevelRole(user, guild);

        //     if (!notifications || !channelId) continue;

        //     if (sourceGuild && sourceGuild.channelId && (sG.guildId === sourceGuild.guildId)) {
        //         const channel = guild.channels.cache.get(sourceGuild.channelId) as TextChannel;
        //         if (!channel) continue;
        //         const levelUpMesssagePayload = await getLevelUpMessagePayload(client, user, guild);

        //         const existing = await getMessage({
        //             channelId: channel.id,
        //             targetUserId: user.id,
        //             name: "levelUpMessage"
        //         });

        //         if (existing) {
        //             const message = await channel.messages.fetch(existing.messageId);
        //             await message.edit(levelUpMesssagePayload)
        //                 .catch(error => {
        //                     console.log("Error while editing level up message: ", error);
        //                 }); 
        //             continue;
        //         }

        //         await channel.send(levelUpMesssagePayload)
        //             .then(async message => {
        //                 await message.react("🎉");
        //                 await createMessage(message, user.id, "levelUpMessage");
        //             })
        //             .catch(error => {
        //                 console.log("Error while sending level up message: ", error);
        //             });
        //     }
        // }
    }
}