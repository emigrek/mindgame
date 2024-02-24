import { PresenceActivityDocumentWithSeconds, VoiceActivityDocumentWithSeconds, getPresenceActivitiesByGuildId, getVoiceActivitiesByChannelId } from "@/modules/activity";
import { getGuild } from "@/modules/guild";
import { updateUserStatistics } from "@/modules/user";
import ExtendedClient from "@/client/ExtendedClient";

import {expCalculatorConfig as config} from './expCalculatorConfig';
import moment from "moment";

type ExpUpdaterProps = {
    client: ExtendedClient;
    expCalculatorConfig?: ExpCalculatorConfig;
    logging?: boolean;
}

type ExpUpdaterLog = {
    activity: VoiceActivityDocumentWithSeconds | PresenceActivityDocumentWithSeconds;
    username: string;
    exp: number;
    timestamp: number;
    type: 'voice' | 'presence';
}

class ExpUpdater {
    private client: ExtendedClient;

    private expCalculator: ExpCalculator;
    private logging: boolean;
    private logs: ExpUpdaterLog[];

    public updateTime: number;

    constructor({ client, logging, expCalculatorConfig }: ExpUpdaterProps) {
        this.client = client;
        this.expCalculator = new ExpCalculator(expCalculatorConfig || config);
        this.logging = logging || true;
        this.logs = [];
        this.updateTime = 0;
    }

    async update() {
        const voiceActivities = await getVoiceActivitiesByChannelId()
            .catch(e => { 
                console.log('[ExpUpdater] Error while fetching voice activities: ', e); 
                return []; 
            });
        const presenceActivities = await getPresenceActivitiesByGuildId()
            .catch(e => { 
                console.log('[ExpUpdater] Error while fetching presence activities: ', e); 
                return []; 
            });

        const start = moment();
        await Promise.all([
            ...presenceActivities.flatMap(({ activities }) =>
                activities.map(activity => this.presence(activities, activity))
            ),
            ...voiceActivities.flatMap(({ activities }) =>
                activities.map(activity => this.voice(activities, activity))
            )
        ]).catch(e => {
            console.error(`[ExpUpdater] Error updating experience: `, e);
        });
        this.updateTime = moment().diff(start, 'milliseconds', true);

        if (this.logging) {
            const uniqueUsers = new Set(this.logs.map(log => log.activity.userId));
            const time = new Date(new Date().getTime() - this.updateTime).toLocaleString();

            console.log(`[${time}][ExpUpdater] Updated ${uniqueUsers.size} user(s). (${this.updateTime}ms)`);
            console.log(" ");
        }

        this.logs = [];
    }

    async presence(guildActivities: PresenceActivityDocumentWithSeconds[], activity: PresenceActivityDocumentWithSeconds) {
        const exp = this.expCalculator.getPresence(activity.seconds);
        if (exp === 0) return;

        const user = await this.client.users.fetch(activity.userId);

        if (this.logging) this.logs.push({ username: user.username, activity, exp, timestamp: Date.now(), type: 'presence' });
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

        if (this.logging) this.logs.push({ username: user.username, activity, exp, timestamp: Date.now(), type: 'voice' });
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
        return this.getRandomInt(1, maxExp);
    }

    public getVoice(seconds: number, inVoice: number): number {
        const hours = seconds / 3600;
        const boost = hours < 1 ? 1 : hours ** 2;
        const maxExp = Math.round(seconds * this.voiceBase * boost * (inVoice + 1));
        return this.getRandomInt(1, maxExp);
    }

    private getRandomInt(min: number, max: number): number {
        return Math.floor(this.randomGaussian() * (max - min + 1)) + min;
    }

    private randomGaussian(): number {
        let u = 0,
            v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num / 10.0 + 0.5;
        if (num > 1 || num < 0) return this.randomGaussian();
        return num;
    }
}

export { ExpUpdater, ExpCalculator, ExpCalculatorConfig }