import { Interaction } from "../interfaces";
import { defaultChannelSelect } from "./select/defaultChannelSelect";
import remove from "./buttons/remove";
import notifications from "./buttons/notifications";
import { localeSelect } from "./select/localeSelect";

const interactions: Interaction[] = [
    defaultChannelSelect,
    remove,
    localeSelect,
    notifications
];

export default interactions;