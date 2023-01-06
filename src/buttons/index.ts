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

const buttons: Button[] = [
    notifications,
    levelRoles,
    levelRolesHoist,
    profileTimePublic,
    sweep,
    guildStatistics,
    profile,
    autoSweeping,
    statisticsNotification
];

export default buttons;