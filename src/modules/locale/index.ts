import ExtendedClient from "../../client/ExtendedClient";
import { Guild } from "discord.js";
import { getGuild } from "../guild";

import { Guild as GuildInterface } from "../../interfaces/Guild";

const withGuildLocale = async (client: ExtendedClient, guild: Guild) => {
    const sourceGuild = await getGuild(guild) as GuildInterface;
    client.i18n.setLocale(sourceGuild?.locale);
}

export { withGuildLocale };