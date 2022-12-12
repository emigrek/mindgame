import { Event } from "../interfaces";
import { updateUser } from "../modules/user";

export const userDiscriminatorUpdate: Event = {
    name: "userDiscriminatorUpdate",
    run: async (client, user, oldDiscriminator, newDiscriminator) => {
        await updateUser(user);
    }
}