import i18n from "@/client/i18n";
import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { GuildUser } from "@/interfaces/GuildUser";
import { achievementModel } from "@/modules/achievement";
import { codeBlock } from "@discordjs/formatters";
import moment from "moment";

export interface ProgressResult {
    leveledUp: boolean;
    change: number;
}

export interface BaseAchievementParams<T extends AchievementType> {
    achievementType: AchievementType;
    context?: AchievementTypeContext[T];
}

export type BaseAchievementContext<T extends AchievementType> = AchievementTypeContext[T] | undefined;

export abstract class BaseAchievement<T extends AchievementType> {
    achievementType: AchievementType;
    userId?: string;
    guildId?: string;
    name = "";
    description = "";
    status = "";
    level = 0;
    leveledUpAt = new Date();
    payload?: AchievementTypePayload[T];
    private context?: AchievementTypeContext[T];
    emoji = "";

    constructor(params: BaseAchievementParams<T>) {
        this.achievementType = params.achievementType;
        this.context = params.context;
    }

    abstract progress (context: AchievementTypeContext[T]): Promise<ProgressResult | undefined>;

    async updatePayload(payload: Partial<AchievementTypePayload[T]>): Promise<this> {
        this.payload = {
            ...this.payload,
            ...payload
        } as AchievementTypePayload[T];
        
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
                this.name = i18n.__(`achievements.${this.achievementType}.name`);
                this.description = i18n.__(`achievements.${this.achievementType}.description`);
                if (achievement) {
                    this.level = achievement.level || 0;
                    this.leveledUpAt = achievement.leveledUpAt;
                    this.payload = achievement.payload as AchievementTypePayload[T];
                    this.status = i18n.__mf(`achievements.${this.achievementType}.status`, { ...this.payload });
                }
                return this;
            });
    }

    async check (): Promise<ProgressResult | undefined> {
        if (!this.userId || !this.guildId)
            throw new Error("The achievement must be directed to a user in a guild.");

        return this.get()
            .then(() => this.progress(this.getContext()));
    }

    async levelUp(): Promise<this> {
        if (!this.userId || !this.guildId) 
            throw new Error("The achievement must be directed to a user in a guild.");

        return achievementModel.updateOne({
            userId: this.userId,
            guildId: this.guildId,
            achievementType: this.achievementType
        }, {
            level: this.level + 1,
            leveledUpAt: new Date()
        }, {
            upsert: true
        })
            .then(() => {
                this.level++;
                this.leveledUpAt = new Date();
                return this;
            });
    }
    
    async setLevel(level: number): Promise<this> {
        if (!this.userId || !this.guildId) 
            throw new Error("The achievement must be directed to a user in a guild.");

        return achievementModel.updateOne({
            userId: this.userId,
            guildId: this.guildId,
            achievementType: this.achievementType,
        }, {
            level,
            leveledUpAt: new Date()
        }, {
            upsert: true
        })
            .then(() => {
                this.level = level;
                this.leveledUpAt = new Date();
                return this;
            });
    }

    getContext(): AchievementTypeContext[T] {
        if (!this.context)
            throw new Error("The achievement context is not defined.");
        return this.context;
    }

    get embedField() {
        const name = `${this.emoji}   ${this.name}` + (this.level > 0 ? ` (${i18n.__mf("achievements.misc.level", { level: this.level })})` : "");

        const value = `${this.status}` + "\n"
            + codeBlock(this.description) 
            + (this.level > 0 ? i18n.__mf("achievements.misc.leveledUpAt", { leveledUpAtUnix: moment(this.leveledUpAt).unix() }) : "");

        return {
            name,
            value
        }
    }
}