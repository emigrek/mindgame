import { Select } from "@/interfaces";

import { achievementsDisplaySelect } from "./achievementsDisplaySelect";
import { defaultChannelSelect } from "./defaultChannelSelect";
import { profileEmbedSelect } from "./profileEmbedSelect";
import { profileUserSelect } from "./profileUserSelect";
import { rankingRangeSelect } from "./rankingRangeSelect";
import { rankingSortSelect } from "./rankingSortSelect";
import { rankingUsersSelect } from "./rankingUsersSelect";

const selects: Select[] = [
    defaultChannelSelect,
    rankingSortSelect,
    rankingUsersSelect,
    profileEmbedSelect,
    rankingRangeSelect,
    profileUserSelect,
    achievementsDisplaySelect,
];

export default selects;