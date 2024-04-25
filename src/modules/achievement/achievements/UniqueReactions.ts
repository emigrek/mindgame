import {Achievement, BaseAchievement} from "@/interfaces";

export class UniqueReactions extends BaseAchievement {
    constructor(props: Achievement) {
        super(props);
    }

    async check(): Promise<boolean> {
        return false;
    }
}