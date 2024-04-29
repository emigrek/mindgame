import { AchievementType, AchievementTypePayload } from "@/interfaces";
import { GuildUser } from "@/interfaces/GuildUser";
import { achievementModel } from "@/modules/achievement";

export interface ProgressResult {
    leveledUp: boolean;
    change: number;
}

export abstract class BaseAchievement<T extends AchievementType> {
    abstract achievementType: T;
    userId?: string;
    guildId?: string;
    level: number;
    payload?: AchievementTypePayload[T];

    constructor() {
        this.level = 0;
    }

    abstract progress (level: number): Promise<ProgressResult>;

    async updatePayload(payload: AchievementTypePayload[T]): Promise<this> {
        this.payload = {
            ...payload,
        };

        return achievementModel.updateOne({
            userId: this.userId,
            guildId: this.guildId,
            achievementType: this.achievementType
        }, {
            payload: this.payload
        })
            .then(() => this);
    }

    direct({userId, guildId}: GuildUser): this {
        this.userId = userId;
        this.guildId = guildId;
        return this;
    }

    async get (): Promise<this> {
        if (!this.userId || !this.guildId) 
            throw new Error("The achievement must be directed to a user in a guild.");

        return achievementModel.findOne({
            userId: this.userId,
            guildId: this.guildId,
            achievementType: this.achievementType
        })
            .then((achievement) => {
                if (achievement) {
                    this.level = achievement.level;
                    this.payload = achievement.payload as AchievementTypePayload[T];
                }
                return this;
            });
    }

    async check (): Promise<ProgressResult> {
        if (!this.userId || !this.guildId) 
            throw new Error("The achievement must be directed to a user in a guild.");

        return this.progress(this.level);
    }

    async levelUp(): Promise<this> {
        if (!this.userId || !this.guildId) 
            throw new Error("The achievement must be directed to a user in a guild.");

        return achievementModel.updateOne({
            userId: this.userId,
            guildId: this.guildId,
            achievementType: this.achievementType
        }, {
            level: this.level + 1
        })
            .then(() => {
                this.level++;
                return this;
            });
    }
    
    async setLevel(level: number): Promise<this> {
        if (!this.userId || !this.guildId) 
            throw new Error("The achievement must be directed to a user in a guild.");

        return achievementModel.updateOne({
            userId: this.userId,
            guildId: this.guildId,
            achievementType: this.achievementType
        }, {
            level
        })
            .then(() => {
                this.level = level;
                return this;
            });
    }
}