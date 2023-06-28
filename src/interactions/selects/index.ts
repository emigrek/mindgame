import { Select } from "@/interfaces";

import { defaultChannelSelect } from "./defaultChannelSelect";
import { rankingSortSelect } from "./rankingSortSelect";
import { rankingUsersSelect } from "./rankingUsersSelect";

const selects: Select[] = [
    defaultChannelSelect,
    rankingSortSelect,
    rankingUsersSelect
];

export default selects;