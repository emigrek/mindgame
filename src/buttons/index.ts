import { Button } from "../interfaces";

import notifications from "./notifications";
import statisticsNotification from "./statisticsNotification";
import levelRoles from "./levelRoles";
import levelRolesHoist from "./levelRolesHoist";
import profileTimePublic from "./profileTimePublic";
import sweep from "./sweep";
import guildStatistics from "./guildStatistics";
import profile from "./profile";
import autoSweeping from "./autoSweeping";
import commits from "./commits";
import roleColorSwitch from "./roleColorSwitch";
import roleColorUpdate from "./roleColorUpdate";
import ranking from "./ranking";
import rankingPageUp from "./rankingPageUp";
import rankingPageDown from "./rankingPageDown";
import rankingGuildOnly from "./rankingGuildOnly";
import help from "./help";

const buttons: Button[] = [
    notifications,
    levelRoles,
    levelRolesHoist,
    profileTimePublic,
    sweep,
    guildStatistics,
    profile,
    autoSweeping,
    statisticsNotification,
    commits,
    roleColorSwitch,
    roleColorUpdate,
    ranking,
    rankingPageUp,
    rankingPageDown,
    rankingGuildOnly,
    help
];

export default buttons;