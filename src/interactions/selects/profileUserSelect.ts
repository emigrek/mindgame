import {Select} from "@/interfaces";
import {getProfileMessagePayload} from "@/modules/messages";
import {profileStore} from "@/stores/profileStore";
import {UserSelectMenuInteraction} from "discord.js";

export const profileUserSelect: Select = {
    customId: "profileUserSelect",
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        const profileState = profileStore.get(interaction.user.id);

        const isBot = await client.users.fetch(interaction.values[0])
            .then(user => user.bot)
            .catch(() => true);

        profileState.targetUserId = !isBot ? interaction.values[0] : undefined;

        const profileMessagePayload = await getProfileMessagePayload(client, interaction as UserSelectMenuInteraction);
        await interaction.editReply(profileMessagePayload);
    }
}