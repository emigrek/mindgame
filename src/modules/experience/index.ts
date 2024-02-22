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

type ExpUpdaterLog = {
    activity: VoiceActivityDocumentWithSeconds | PresenceActivityDocumentWithSeconds;
    exp: number;
    timestamp: number;
    type: 'voice' | 'presence';
}

class ExpUpdater {
    private client: ExtendedClient;
    private expCalculator: ExpCalculator;
    private log: boolean;
    private logs: ExpUpdaterLog[];

    constructor({ client, log, expCalculatorConfig }: ExpUpdaterProps) {
        this.client = client;
        this.expCalculator = new ExpCalculator(expCalculatorConfig || config);
        this.log = log || true;
        this.logs = [];
    }

    async update() {
        const numberFormat = this.client.numberFormat;
        const voiceActivities = await getVoiceActivitiesByChannelId();
        const presenceActivities = await getPresenceActivitiesByGuildId();
        if(this.log) {
            console.time("\n\n[ExpUpdater] Updating experience latency")
        }
        
        await Promise.all([
            ...presenceActivities.flatMap(({ activities }) =>
                activities.map(activity => this.presence(activities, activity))
            ),
            ...voiceActivities.flatMap(({ activities }) =>
                activities.map(activity => this.voice(activities, activity))
            )
        ]).catch(e => {
            console.error(`[ExpUpdater] Error updating experience: ${e} <- THIS IS BAD, PROLLY NO CONNECTION TO MONGO DB OR SMTH LIKE THAT.`);
        });

        if (this.log) {
            const uniqueUsers = new Set(this.logs.map(log => log.activity.userId));
            const topVoiceExp = this.logs.filter(log => log.type === 'voice').sort((a, b) => b.exp - a.exp).at(0);
            const topPresenceExp = this.logs.filter(log => log.type === 'presence').sort((a, b) => b.exp - a.exp).at(0);

            console.timeEnd(`\n\n[ExpUpdater] Updating experience latency`);
            console.log(`[ExpUpdater] Updated experience for ${uniqueUsers.size} users`);
            console.log(`[ExpUpdater] Updated at ${new Date().toLocaleString()}`);
            topVoiceExp && console.log(`[ExpUpdater] Top voice: ${numberFormat.format(topVoiceExp.exp).toString()} exp`);
            topPresenceExp && console.log(`[ExpUpdater] Top presence: ${numberFormat.format(topPresenceExp.exp).toString()} exp`);
            console.log(`\n\n`);
        }

        this.logs = [];
    }

    async presence(guildActivities: PresenceActivityDocumentWithSeconds[], activity: PresenceActivityDocumentWithSeconds) {
        const exp = this.expCalculator.getPresence(activity.seconds);
        if (exp === 0) return;

        const user = await this.client.users.fetch(activity.userId);

        if (this.log) this.logs.push({ activity, exp, timestamp: Date.now(), type: 'presence' });
        return updateUserStatistics(this.client, user, {
            exp: exp,
            time: {
                presence: 60
            }
        });
    }

    async voice(channelActivities: VoiceActivityDocumentWithSeconds[], activity: VoiceActivityDocumentWithSeconds) {
        const exp = this.expCalculator.getVoice(activity.seconds, channelActivities.length);
        if (exp === 0) return;

        const user = await this.client.users.fetch(activity.userId);
        const guild = this.client.guilds.cache.get(activity.guildId);

        if (this.log) this.logs.push({ activity, exp, timestamp: Date.now(), type: 'voice' });
        return updateUserStatistics(this.client, user, {
            exp: exp,
            time: {
                voice: 60
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
        const hours = seconds / 3600;
        const cap = hours < 1 ? 1 : 0.5;
        const maxExp = Math.round(seconds * this.base * cap);
        return this.getRandomInt(0, maxExp);
    }

    public getVoice(seconds: number, inVoice: number): number {
        const hours = seconds / 3600;
        const boost = hours < 1 ? 1 : hours ** 2;
        const maxExp = Math.round(seconds * this.voiceBase * boost * (inVoice + 1));
        return this.getRandomInt(0, maxExp);
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export { ExpUpdater, ExpCalculator, ExpCalculatorConfig }