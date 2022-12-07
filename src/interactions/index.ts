import { Interaction } from "../interfaces";
import { defaultChannelSelect } from "./select/defaultChannelSelect";
import en from "./buttons/en";
import pl from "./buttons/pl";
import remove from "./buttons/remove";

const interactions: Interaction[] = [
    defaultChannelSelect,
    en,
    pl,
    remove
];

export default interactions;