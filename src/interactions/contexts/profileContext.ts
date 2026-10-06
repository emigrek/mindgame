import { ContextMenu, ProfilePages } from "@/interfaces";
import { getProfileMessagePayload } from "@/modules/messages";
import { profileStore } from "@/stores/profileStore";
import { ApplicationCommandType, ContextMenuCommandBuilder, MessageFlags, UserContextMenuCommandInteraction } from "discord.js";

const profileContext: ContextMenu = {
    data: new ContextMenuCommandBuilder()
        .setName('profile')
        .setType(ApplicationCommandType.User),
    run: async (client, interaction) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const profileState = profileStore.get(interaction.user.id);

        profileState.targetUserId = interaction.targetId;
        profileState.page = ProfilePages.About;
        
        const profileMessagePayload = await getProfileMessagePayload(client, interaction as UserContextMenuCommandInteraction);
        await interaction.followUp(profileMessagePayload);
    }
};

export default profileContext;