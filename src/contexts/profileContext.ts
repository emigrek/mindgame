import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { ContextMenu } from "../interfaces";
import { getUserMessagePayload } from "../modules/messages";
import { profileStore } from "../stores/profileStore";

const profileContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('profile')
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        
        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = interaction.targetId;
        
        const profileMessagePayload = await getUserMessagePayload(client, interaction as UserContextMenuCommandInteraction);
        await interaction.followUp(profileMessagePayload);
    }
};

export default profileContext;