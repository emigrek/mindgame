import { Event } from "@/interfaces";
import { updateUser } from "@/modules/user";

export const userUpdate: Event<"userUpdate"> = {
    name: "userUpdate",
    run: async (client, oldUser, newUser) => {
        await updateUser(newUser);
    }
}