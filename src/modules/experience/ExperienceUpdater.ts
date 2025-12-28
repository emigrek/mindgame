import ExtendedClient from "@/client/ExtendedClient";
import {
  getPresenceActivitiesByGuildId,
  getVoiceActivitiesByChannelId,
  PresenceActivitiesByGuildId,
  PresenceActivityDocumentWithSeconds,
  VoiceActivitiesByChannelId,
  VoiceActivityDocumentWithSeconds,
} from "@/modules/activity";
import moment from "moment";

import { config } from "@/config";
import { ExperienceCalculator } from "@/modules/experience/ExperienceCalculator";
import { updateUserGuildStatistics } from "@/modules/user-guild-statistics";

type UserGuildExperienceData = {
  userId: string;
  voice?: number;
  presence?: number;
};

class ExperienceUpdater {
  readonly client: ExtendedClient;
  readonly logging: boolean;
  public lastUpdateTimeInMs: number;

  private voiceActivities: VoiceActivitiesByChannelId[] = [];
  private presenceActivities: PresenceActivitiesByGuildId[] = [];

  private cache: Map<string, UserGuildExperienceData[]> = new Map();

  constructor({
    client,
    logging,
  }: {
    client: ExtendedClient;
    logging?: boolean;
  }) {
    this.client = client;
    this.logging = logging ?? true;
    this.lastUpdateTimeInMs = 0;
  }

  public async update() {
    this.cache.clear();

    this.voiceActivities = await getVoiceActivitiesByChannelId();
    this.presenceActivities = await getPresenceActivitiesByGuildId();

    const start = moment();

    this.fillCache();
    await this.applyCache();

    this.lastUpdateTimeInMs = moment().diff(start, "milliseconds", true);
    if (this.logging) this.logUpdate();
  }

  public async getLogDetails(): Promise<{
    users: number;
    guilds: number;
  }> {
    const [voiceActivities, presenceActivities] = await Promise.all([
      getVoiceActivitiesByChannelId(),
      getPresenceActivitiesByGuildId(),
    ]);

    const guildToUsers = new Map<string, Set<string>>();

    const add = (guildId: string, userId: string) => {
      const set = guildToUsers.get(guildId) ?? new Set<string>();
      set.add(userId);
      guildToUsers.set(guildId, set);
    };

    if (config.experience.voice.enabled) {
      for (const group of voiceActivities) {
        for (const a of group.activities) add(a.guildId, a.userId);
      }
    }

    if (config.experience.presence.enabled) {
      for (const group of presenceActivities) {
        for (const a of group.activities) add(a.guildId, a.userId);
      }
    }

    let users = 0;
    for (const set of guildToUsers.values()) users += set.size;

    return { users, guilds: guildToUsers.size };
  }

  private accumulateVoice(
    activity: VoiceActivityDocumentWithSeconds,
    inVoice: number
  ) {
    this.updateCache(activity.guildId, {
      userId: activity.userId,
      voice: ExperienceCalculator.getVoiceReward(activity.seconds, inVoice),
    });
  }

  private accumulatePresence(activity: PresenceActivityDocumentWithSeconds) {
    this.updateCache(activity.guildId, {
      userId: activity.userId,
      presence: ExperienceCalculator.getPresenceReward(activity.seconds),
    });
  }

  private updateCache(guildId: string, payload: UserGuildExperienceData) {
    const guild = this.cache.get(guildId);
    if (!guild) {
      return this.cache.set(guildId, [
        payload,
        ...(this.cache.get(guildId) || []),
      ]);
    }

    const user = guild.find((user) => user.userId === payload.userId);
    if (!user) {
      return guild.push(payload);
    } else {
      user.voice = (user.voice || 0) + (payload.voice || 0);
      user.presence = (user.presence || 0) + (payload.presence || 0);
    }

    this.cache.set(guildId, guild);
  }

  private fillCache() {
    if (config.experience.voice.enabled) {
      this.voiceActivities.flatMap(({ activities }) =>
        activities.forEach((activity) => {
          this.accumulateVoice(activity, activities.length);
        })
      );
    }

    if (config.experience.presence.enabled) {
      this.presenceActivities.flatMap(({ activities }) =>
        activities.forEach((activity) => {
          this.accumulatePresence(activity);
        })
      );
    }
  }

  private applyCache() {
    const promises = Array.from(this.cache.entries()).map(([guildId, cache]) =>
      cache.map(async ({ userId, voice, presence }) =>
        updateUserGuildStatistics({
          client: this.client,
          userId: userId,
          guildId: guildId,
          update: {
            exp: (voice || 0) + (presence || 0),
            time: {
              voice: voice ? 60 : 0,
              presence: presence ? 60 : 0,
            },
          },
        })
      )
    );

    return Promise.all(promises.flat());
  }

  private logUpdate() {
    const { users, guilds } = this.getLastLogDetails();
    console.log(
      `[ExperienceUpdater] Updated ${guilds} guild(s) (${users} user(s)) in ${this.lastUpdateTimeInMs}ms.`
    );
  }

  public getLastLogDetails() {
    return {
      users: Array.from(this.cache.values()).reduce(
        (acc, val) => acc + val.length,
        0
      ),
      guilds: this.cache.size,
    };
  }
}

export { ExperienceUpdater };
