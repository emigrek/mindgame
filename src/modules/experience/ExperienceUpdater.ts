import ExtendedClient from "@/client/ExtendedClient";
import { ExperienceCalculatorConfig } from "@/interfaces";
import { PresenceActivitiesByGuildId, PresenceActivityDocumentWithSeconds, VoiceActivitiesByChannelId, VoiceActivityDocumentWithSeconds, getPresenceActivitiesByGuildId, getVoiceActivitiesByChannelId } from "@/modules/activity";
import moment from "moment";

import { ExperienceCalculator } from './ExperienceCalculator';

import { config } from '@/config';
import { updateUserGuildStatistics } from "../user-guild-statistics";

type UserGuildExperienceData = Partial<{
    userId: string;
    voice: number;
    presence: number;
}>;

class ExperienceUpdater {
    private client: ExtendedClient;
    private calculator: ExperienceCalculator;
    private logging: boolean;
    public lastUpdateTimeInMs: number;

    private voiceActivities: VoiceActivitiesByChannelId[] =  [];
    private presenceActivities: PresenceActivitiesByGuildId[] = [];

    private cache: Map<string, UserGuildExperienceData[]> = new Map();

    constructor({ client, logging, calculatorConfig }: {
        client: ExtendedClient;
        calculatorConfig?: ExperienceCalculatorConfig;
        logging?: boolean;
    }) {
        this.client = client;
        this.calculator = new ExperienceCalculator(calculatorConfig || config.experienceCalculatorConfig);
        this.logging = logging || true;
        this.lastUpdateTimeInMs = 0;
    }

    public async update() {
        this.voiceActivities = await getVoiceActivitiesByChannelId();
        this.presenceActivities = await getPresenceActivitiesByGuildId();

        const start = moment();

        this.fillCache();
        await this.applyCache();

        this.lastUpdateTimeInMs = moment().diff(start, 'milliseconds', true);
        if (this.logging) this.logUpdate();
        this.cache.clear();
    }

    private accumulateVoice(activity: VoiceActivityDocumentWithSeconds, inVoice: number) {
        const exp = this.calculator.getVoice(activity.seconds, inVoice);
        if (!exp) return;

        this.updateCache(activity.guildId, {
            userId: activity.userId,
            voice: exp,
        });
    }

    private accumulatePresence(activity: PresenceActivityDocumentWithSeconds) {
        const exp = this.calculator.getPresence(activity.seconds);
        if (!exp) return;

        this.updateCache(activity.guildId, {
            userId: activity.userId,
            presence: exp,
        });
    }

    private updateCache(guildId: string, payload: UserGuildExperienceData) {
        const guild = this.cache.get(guildId);
        if (!guild) {
            return this.cache.set(guildId, [payload, ...(this.cache.get(guildId) || [])]);
        }

        const user = guild.find(user => user.userId === payload.userId);
        
        if (!user) {
            return guild.push(payload);
        } else {
            user.voice = (user.voice || 0) + (payload.voice || 0);
            user.presence = (user.presence || 0) + (payload.presence || 0);
        }
        
        this.cache.set(guildId, guild);
    }

    private fillCache() {
        this.voiceActivities.flatMap(({ activities }) => 
            activities.forEach(activity => {
                this.accumulateVoice(activity, activities.length);
            }),
        );

        this.presenceActivities.flatMap(({ activities }) =>
            activities.forEach(activity => {
                this.accumulatePresence(activity);
            }),
        );
    }

    private applyCache() {
        const promises = Array
            .from(this.cache.entries())
            .map(async ([guildId, cache]) => {
                return Promise.all(cache.map(async ({ userId, voice, presence }) => {
                    if (!userId) return;

                    return updateUserGuildStatistics({
                        client: this.client,
                        userId: userId,
                        guildId: guildId,
                        update: {
                            exp: (voice || 0) + (presence || 0),
                            time: {
                                voice: voice ? 60 : 0,
                                presence: presence ? 60 : 0,
                            }
                        }
                    });
                }));
            })

        return Promise.all(promises);
    }

    private logUpdate() {
        const timestamp = new Date(new Date().getTime() - this.lastUpdateTimeInMs).toLocaleString();
        const cacheSize = this.cache.size;
        console.log(`[${timestamp}][ExperienceUpdater] Updated ${cacheSize} user(s) in ${this.lastUpdateTimeInMs}ms.`);
    }
}

export { ExperienceUpdater };

