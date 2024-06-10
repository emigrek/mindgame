import { Button } from "@/interfaces";

import achievementsPageDown from "./achievementsPageDown";
import achievementsPageUp from "./achievementsPageUp";
import autoSweeping from "./autoSweeping";
import commits from "./commits";
import help from "./help";
import levelRoles from "./levelRoles";
import levelRolesHoist from "./levelRolesHoist";
import notifications from "./notifications";
import profile from "./profile";
import profileFollow from "./profileFollow";
import profileTimePublic from "./profileTimePublic";
import ranking from "./ranking";
import rankingPageDown from "./rankingPageDown";
import rankingPageUp from "./rankingPageUp";
import rankingSettings from "./rankingSettings";
import roleColorDisable from "./roleColorDisable";
import roleColorPick from "./roleColorPick";
import roleColorUpdate from "./roleColorUpdate";
import selectMessageDelete from "./selectMessageDelete";
import selectReroll from "./selectReroll";
import sweep from "./sweep";
const buttons: Button[] = [
    achievementsPageDown,
    achievementsPageUp,
    notifications,
    levelRoles,
    levelRolesHoist,
    profileTimePublic,
    sweep,
    profile,
    profileFollow,
    autoSweeping,
    commits,
    roleColorPick,
    roleColorUpdate,
    roleColorDisable,
    ranking,
    rankingPageUp,
    rankingPageDown,
    rankingSettings,
    help,
    selectMessageDelete,
    selectReroll
];

export default buttons;