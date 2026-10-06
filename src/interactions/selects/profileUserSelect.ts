import {ProfilePages, Select} from "@/interfaces";
import {getProfileMessagePayload} from "@/modules/messages";
import { profileStore, restoreProfileState } from "@/stores/profileStore";
import {UserSelectMenuInteraction} from "discord.js";

export const profileUserSelect: Select = {
    customId: "profileUserSelect",
    run: async (client, interaction, ...args) => {
        await interaction.deferUpdate();
        restoreProfileState(interaction.user.id, args);

        const profileState = profileStore.get(interaction.user.id);

        const isBot = await client.users.fetch(interaction.values[0])
            .then(user => user.bot)
            .catch(() => true);

        profileState.page = ProfilePages.About;
        profileState.targetUserId = !isBot ? interaction.values[0] : undefined;

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as UserSelectMenuInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}