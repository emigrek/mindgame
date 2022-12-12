import { Event } from "../interfaces";
import { updateUser } from "../modules/user";

export const userUsernameUpdate: Event = {
    name: "userUsernameUpdate",
    run: async (client, user, oldUsername, newUsername) => {
        await updateUser(user);
    }
}