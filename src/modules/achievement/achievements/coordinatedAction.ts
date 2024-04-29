import { AchievementType, GradualAchievement } from "@/interfaces";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";

interface CoordinatedActionPayload {
    first?: VoiceActivityDocument;
    second?: VoiceActivityDocument;
}

export class CoordinatedAction extends GradualAchievement<AchievementType.COORDINATED_ACTION> {
    achievementType: AchievementType.COORDINATED_ACTION = AchievementType.COORDINATED_ACTION;
    first?: VoiceActivityDocument;
    second?: VoiceActivityDocument;
    thresholds = [
        {
            value: 1000 * 60 * 10,
            level: 1
        },
        {
            value: 1000 * 60 * 5,
            level: 2
        },
        {
            value: 1000 * 60 * 2,
            level: 3
        },
        {
            value: 1000 * 60,
            level: 4
        },
        {
            value: 1000 * 15,
            level: 5
        },
        {
            value: 1000 * 5,
            level: 6
        },
        {
            value: 1000 * 1,
            level: 7
        },
        {
            value: 1000 * 0.5,
            level: 8
        },
        {
            value: 1000 * 0.25,
            level: 9
        }
    ]

    constructor({first, second}: CoordinatedActionPayload) {
        super();
        this.first = first;
        this.second = second;
    }

    async progress() {
        if (!this.first || !this.second) 
            throw new Error("The achievement must have two voice activities to progress.");

        const fTimestamp = this.first.from.getTime();
        const sTimestamp = this.second.from.getTime();
        const diff = Math.abs(sTimestamp - fTimestamp);
        const { level } = this.getThreshold({ value: diff, level: this.level });
        return level ? this.updatePayload({ ms: diff })
            .then(() => this.setLevel(level))
            .then(() => ({ leveledUp: true, change: level })) : { leveledUp: false, change: 0 };
    }
}