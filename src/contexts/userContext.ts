import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu, User } from "../interfaces";
import { getUser } from "../modules/user";

const userContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName(`Show user profile`)
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        const { targetUser } = interaction as UserContextMenuCommandInteraction;
        const sourceUser = await getUser(targetUser) as User;
    }
};

export default userContext;