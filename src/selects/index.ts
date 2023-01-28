import { Select } from "../interfaces";
import { defaultChannelSelect } from "./defaultChannelSelect";
import { localeSelect } from "./localeSelect";
import { rankingSortSelect } from "./rankingSortSelect";

const selects: Select[] = [
    defaultChannelSelect,
    rankingSortSelect,
    localeSelect
];

export default selects;