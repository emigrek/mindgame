import i18n from "@/client/i18n";
import { AchievementType, AchievementTypeContext, AchievementTypePayload } from "@/interfaces";
import { GuildUser } from "@/interfaces/GuildUser";
import { achievementModel } from "@/modules/achievement";
import { codeBlock } from "@discordjs/formatters";

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
    name: string;
    description: string;
    level = 0;
    payload?: AchievementTypePayload[T];
    private context?: AchievementTypeContext[T];
    emoji = "";

    constructor(params: BaseAchievementParams<T>) {
        this.achievementType = params.achievementType;
        this.context = params.context;
        this.name = i18n.__(`achievements.${this.achievementType}.name`);
        this.description = i18n.__(`achievements.${this.achievementType}.description`);
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
                if (achievement) {
                    this.level = achievement.level;
                    this.payload = achievement.payload as AchievementTypePayload[T];
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

    getContext(): AchievementTypeContext[T] {
        if (!this.context)
            throw new Error("The achievement context is not defined.");
        return this.context;
    }

    get embedField() {
        return {
            name: `${this.emoji}   ${this.name}`,
            value: `Level: \`${this.level}\`\n${codeBlock(this.description)}`
        };
    }
}