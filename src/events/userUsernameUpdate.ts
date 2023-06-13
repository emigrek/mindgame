import { Event } from "../interfaces";
import { updateUser } from "../modules/user";

export const userUsernameUpdate: Event = {
    name: "userUsernameUpdate",
    run: async (client, user) => {
        await updateUser(user);
    }
}