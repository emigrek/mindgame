import { ContextMenu } from "../interfaces";
import profileContext from "./profileContext";
import guildStatisitcsContext from "./guildStatisticsContext";
import sweepContext from "./sweepContext";
import followContext from "./followContext";
import unfollowContext from "./unfollowContext";

const contexts: ContextMenu[] = [
    profileContext,
    guildStatisitcsContext,
    sweepContext,
    followContext,
    unfollowContext
];

export default contexts;