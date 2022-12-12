import { Event } from "../interfaces";
import { updateUser } from "../modules/user";

export const userAvatarUpdate: Event = {
    name: "userAvatarUpdate",
    run: async (client, user, oldAvatarURL, newAvatarURL) => {
        await updateUser(user);
    }
}