import { Button } from "@/interfaces";

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
import roleColorPick from "./roleColorPick";
import roleColorUpdate from "./roleColorUpdate";
import roleColorDisable from "./roleColorDisable";
import ranking from "./ranking";
import rankingPageUp from "./rankingPageUp";
import rankingPageDown from "./rankingPageDown";
import rankingGuildOnly from "./rankingGuildOnly";
import rankingSettings from "./rankingSettings";
import help from "./help";
import profileFollow from "./profileFollow";
import selectMessageDelete from "./selectMessageDelete";
import selectReroll from "./selectReroll";

const buttons: Button[] = [
    notifications,
    levelRoles,
    levelRolesHoist,
    profileTimePublic,
    sweep,
    guildStatistics,
    profile,
    profileFollow,
    autoSweeping,
    statisticsNotification,
    commits,
    roleColorPick,
    roleColorUpdate,
    roleColorDisable,
    ranking,
    rankingPageUp,
    rankingPageDown,
    rankingGuildOnly,
    rankingSettings,
    help,
    selectMessageDelete,
    selectReroll
];

export default buttons;