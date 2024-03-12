import { PresenceActivitiesByGuildId, PresenceActivityDocumentWithSeconds, VoiceActivitiesByChannelId, VoiceActivityDocumentWithSeconds, getPresenceActivitiesByGuildId, getVoiceActivitiesByChannelId } from "@/modules/activity";
import { getGuild } from "@/modules/guild";
import { updateUserStatistics } from "@/modules/user";
import ExtendedClient from "@/client/ExtendedClient";
import moment from "moment";
import { ExperienceCalculatorConfig } from "@/interfaces";

import { ExperienceCalculator } from './ExperienceCalculator';

import { config } from '@/config';

type UserExperienceData = Partial<{
    voice: {
        experience: number;
        sourceGuildId: string;
    };
    presence: {
        experience: number;
    };
}>;

class ExperienceUpdater {
    private client: ExtendedClient;
    private calculator: ExperienceCalculator;
    private logging: boolean;
    public lastUpdateTimeInMs: number;

    private voiceActivities: VoiceActivitiesByChannelId[] =  [];
    private presenceActivities: PresenceActivitiesByGuildId[] = [];

    private cache: Map<string, UserExperienceData> = new Map();

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

        this.updateCache(activity.userId, {
            voice: {
                experience: exp,
                sourceGuildId: activity.guildId,
            }
        });
    }

    private accumulatePresence(activity: PresenceActivityDocumentWithSeconds) {
        const exp = this.calculator.getPresence(activity.seconds);
        if (!exp) return;

        this.updateCache(activity.userId, {
            presence: {
                experience: exp,
            }
        });
    }

    private updateCache(userId: string, payload: UserExperienceData) {
        const current = this.cache.get(userId);
        if (!current) {
            this.cache.set(userId, payload);
            return;
        }

        if (payload.voice) {
            if (current.voice) {
                current.voice.experience += payload.voice.experience;
            } else {
                current.voice = payload.voice;
            }
        }

        if (payload.presence) {
            if (current.presence) {
                current.presence.experience += payload.presence.experience;
            } else {
                current.presence = payload.presence;
            }
        }

        this.cache.set(userId, current);
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
            .map(async ([userId, cache]) => {
                const user = this.client.users.cache.get(userId);
                if (!user) return;
                
                const guild = this.client.guilds.cache.get(cache.voice?.sourceGuildId || '');
                const guildContext = guild ? await getGuild(guild) || undefined : undefined;
                
                await updateUserStatistics(this.client, user, {
                    exp: (cache.voice?.experience || 0) + (cache.presence?.experience || 0),
                    time: {
                        voice: cache.voice ? 60 : 0,
                        presence: cache.presence ? 60 : 0,
                    }
                }, guildContext);
            });

        return Promise.all(promises);
    }

    private logUpdate() {
        const timestamp = new Date(new Date().getTime() - this.lastUpdateTimeInMs).toLocaleString();
        const cacheSize = this.cache.size;
        console.log(`[${timestamp}][ExperienceUpdater] Updated ${cacheSize} user(s) in ${this.lastUpdateTimeInMs}ms.`);
    }
}

export { ExperienceUpdater };