import { AchievementType, AchievementTypePayload } from "@/interfaces";
import { GuildUser } from "@/interfaces/GuildUser";
import { achievementModel } from "@/modules/achievement";

export interface ProgressResult {
    leveledUp: boolean;
    change: number;
}

export abstract class BaseAchievement<T extends AchievementType> {
    abstract achievementType: AchievementType;
    userId?: string;
    guildId?: string;
    level = 0;
    payload?: AchievementTypePayload[T];
    emoji = "";

    abstract progress (): Promise<ProgressResult>;

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
        }, {
            upsert: true,
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
        return this.progress();
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
        }, {
            upsert: true
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
        }, {
            upsert: true
        })
            .then(() => {
                this.level = level;
                return this;
            });
    }
}