import { PresenceActivityDocumentWithSeconds, VoiceActivityDocumentWithSeconds, getPresenceActivitiesByGuildId, getVoiceActivitiesByChannelId } from "@/modules/activity";
import { getGuild } from "@/modules/guild";
import { updateUserStatistics } from "@/modules/user";
import ExtendedClient from "@/client/ExtendedClient";

import {expCalculatorConfig as config} from './expCalculatorConfig';

type ExpUpdaterProps = {
    client: ExtendedClient;
    expCalculatorConfig?: ExpCalculatorConfig;
    log?: boolean;
}

class ExpUpdater {
    client: ExtendedClient;
    expCalculator: ExpCalculator;
    log: boolean;

    constructor({ client, log, expCalculatorConfig }: ExpUpdaterProps) {
        this.client = client;
        this.expCalculator = new ExpCalculator(expCalculatorConfig || config);
        this.log = log || true;
    }

    async update() {
        const voiceActivities = await getVoiceActivitiesByChannelId();
        const presenceActivities = await getPresenceActivitiesByGuildId();
        
        Promise.all([
            ...presenceActivities.flatMap(({ activities }) =>
                activities.map(activity => this.presence(activities, activity))
            ),
            ...voiceActivities.flatMap(({ activities }) =>
                activities.map(activity => this.voice(activities, activity))
            )
        ]).then((users) => {
            if (this.log) {
                console.log(`[ExpUpdater] Updated ${users.length} users.`);
            }
        })
        .catch(e => {
            console.log("There was an error while updating experience: ", e);
        });
    }

    async presence(guildActivities: PresenceActivityDocumentWithSeconds[], activity: PresenceActivityDocumentWithSeconds) {
        const exp = this.expCalculator.getPresence(activity.seconds);
        const user = await this.client.users.fetch(activity.userId);
        return updateUserStatistics(this.client, user, {
            exp: exp,
            time: {
                presence: activity.seconds
            }
        });
    }

    async voice(channelActivities: VoiceActivityDocumentWithSeconds[], activity: VoiceActivityDocumentWithSeconds) {
        const exp = this.expCalculator.getVoice(activity.seconds, channelActivities.length);
        const user = await this.client.users.fetch(activity.userId);
        const guild = this.client.guilds.cache.get(activity.guildId);
        
        return updateUserStatistics(this.client, user, {
            exp: exp,
            time: {
                voice: activity.seconds
            }
        }, guild ? await getGuild(guild) || undefined : undefined);
    }
}

interface ExpCalculatorConfig {
    base: number;
    voiceBase: number;
}

class ExpCalculator {
    base: number;
    voiceBase: number;

    constructor({ base, voiceBase }: ExpCalculatorConfig) {
        this.base = base;
        this.voiceBase = voiceBase;
    }

    public getPresence(seconds: number): number {
        return Math.round(seconds * this.base);
    }

    public getVoice(seconds: number, inVoice: number): number {
        const hours = seconds / 3600;
        const boost = hours < 1 ? 1 : hours ** 2;
        return Math.round(seconds * this.voiceBase * boost * (inVoice + 1));
    }
}

export { ExpUpdater, ExpCalculator, ExpCalculatorConfig }