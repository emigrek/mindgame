import { Select } from "@/interfaces";

import { defaultChannelSelect } from "./defaultChannelSelect";
import { profileEmbedSelect } from "./profileEmbedSelect";
import { rankingRangeSelect } from "./rankingRangeSelect";
import { rankingSortSelect } from "./rankingSortSelect";
import { rankingUsersSelect } from "./rankingUsersSelect";

const selects: Select[] = [
    defaultChannelSelect,
    rankingSortSelect,
    rankingUsersSelect,
    profileEmbedSelect,
    rankingRangeSelect,
];

export default selects;