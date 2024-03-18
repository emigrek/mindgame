import { Select } from "@/interfaces";

import { defaultChannelSelect } from "./defaultChannelSelect";
import { rankingSortSelect } from "./rankingSortSelect";
import { rankingUsersSelect } from "./rankingUsersSelect";
import { userEmbedSelect } from "./userEmbedSelect";

const selects: Select[] = [
    defaultChannelSelect,
    rankingSortSelect,
    rankingUsersSelect,
    userEmbedSelect,
];

export default selects;