import ExtendedClient from "@/client/ExtendedClient";
import { ClientPresenceStatusData } from "discord.js";

import { PresenceActivityDocument } from "@/modules/schemas/PresenceActivity";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";

import i18n from "@/client/i18n";
import moment from "moment";
import { getLastUserVoiceActivity, getLastUserPresenceActivity, getUserClientsTime } from "./queries";

const getPresenceClientStatus = (clientStatus?: ClientPresenceStatusData | null): string => {
    if (!clientStatus)
        return 'unknown';
    else if (clientStatus.desktop)
        return 'desktop';
    else if (clientStatus.mobile)
        return 'mobile';
    else if (clientStatus.web)
        return 'web';
    else
        return 'unknown';
}
interface UserLastActivityDetails {
    voice: {
        activity: VoiceActivityDocument;
        guildName: string | null;
        guildId: string;
        channelId: string;
    } | null;
    presence: {
        activity: PresenceActivityDocument;
        guildName: string | null;
        guildId: string;
        client: string;
    } | null;
}
const getUserLastActivityDetails = async (client: ExtendedClient, userId: string): Promise<UserLastActivityDetails> => {
    const lastVoiceActivity = await getLastUserVoiceActivity(userId);
    const lastPresenceActivity = await getLastUserPresenceActivity(userId);

    const lastVoiceActivityGuild = lastVoiceActivity ? await client.guilds.fetch(lastVoiceActivity.guildId) : null;
    const lastPresenceActivityGuild = lastPresenceActivity ? await client.guilds.fetch(lastPresenceActivity.guildId) : null;

    const voice = lastVoiceActivity ? {
        activity: lastVoiceActivity,
        guildName: lastVoiceActivityGuild ? lastVoiceActivityGuild.name : null,
        guildId: lastVoiceActivity.guildId,
        channelId: lastVoiceActivity.channelId
    } : null;

    const presence = lastPresenceActivity ? {
        activity: lastPresenceActivity,
        guildName: lastPresenceActivityGuild ? lastPresenceActivityGuild.name : null,
        guildId: lastPresenceActivity.guildId,
        client: clientStatusToEmoji(lastPresenceActivity.client)
    } : null;

    return {
        voice,
        presence
    };
};
const formatLastActivityDetails = (details: UserLastActivityDetails) => {
    let voice, presence;

    if (!details.voice) {
        voice = ""
    } else if (details.voice.activity.to !== null) {
        voice = i18n.__mf("profile.lastVoiceActivity", {
            time: `<t:${moment(details.voice.activity.to).unix()}:R>`,
            guild: `[${details.voice.guildName}](https://discord.com/channels/${details.voice.guildId}/${details.voice.channelId})`,
        });
    } else {
        voice = i18n.__mf("profile.currentVoiceActivity", {
            time: `<t:${moment(details.voice.activity.from).unix()}:t>`,
            guild: `[${details.voice.guildName}](https://discord.com/channels/${details.voice.guildId}/${details.voice.channelId})`,
        });
    }

    if (!details.presence) {
        presence = "";
    } else if (details.presence.activity.to !== null) {
        presence = i18n.__mf("profile.lastPresenceActivity", {
            time: `<t:${moment(details.presence.activity.to).unix()}:R>`,
            guild: `[${details.presence.guildName}](https://discord.com/channels/${details.presence.guildId})`,
            client: details.presence.client
        });
    } else {
        presence = i18n.__mf("profile.currentPresenceActivity", {
            time: `<t:${moment(details.presence.activity.from).unix()}:t>`,
            guild: `[${details.presence.guildName}](https://discord.com/channels/${details.presence.guildId})`,
            client: details.presence.client
        });
    }

    return `\n${voice}\n${presence}`;
};
interface GetUserClientProps {
    clients: string[];
    mostUsed?: string;
}
const getUserClients = async (userId: string): Promise<GetUserClientProps> => {
    const clients = new Map<string, number>();
    const activities = await getUserClientsTime(userId);

    for (const activity of activities) {
        const client = activity.client;
        clients.set(client, (clients.get(client) ?? 0) + activity.seconds);
    }

    const sorted = Array.from(clients).sort((a, b) => b[1] - a[1]);
    return {
        clients: sorted.map(([client]) => client),
        mostUsed: sorted[0] ? sorted[0][0] : undefined
    };
}
const clientStatusToEmoji = (client: string) => {
    switch (client) {
        case 'desktop':
            return '🖥️';
        case 'mobile':
            return '📱';
        case 'web':
            return '🌐';
        default:
            return '❔';
    }
}

export { getPresenceClientStatus, getUserLastActivityDetails, formatLastActivityDetails, getUserClients, clientStatusToEmoji };
