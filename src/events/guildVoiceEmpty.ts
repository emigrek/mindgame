import {config} from "@/config";
import {Event} from "@/interfaces";
import {getGuild, getNotificationChannel} from "@/modules/guild";
import {sweepTextChannel} from "@/modules/messages";
import {delay} from '@/utils/delay';

export const guildVoiceEmpty: Event<"guildVoiceEmpty"> = {
    name: "guildVoiceEmpty",
    run: async (client, guildId, lastChannel) => {
        const sourceGuild = await getGuild(guildId);
        if (!sourceGuild || !sourceGuild.autoSweeping) return;

        await delay(config.emptyGuildSweepTimeoutMs);
        await sweepTextChannel(client, lastChannel);

        // Swept even with notifications turned off
        const guildDefaultChannel = await getNotificationChannel(client, guildId, { requireNotifications: false });
        if (!guildDefaultChannel) return;

        await sweepTextChannel(client, guildDefaultChannel);
    }
}