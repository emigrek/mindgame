import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { updateUser } from "@/modules/user";
import { User } from "discord.js";

export const userUpdate: Event = {
    name: "userUpdate",
    run: async (client: ExtendedClient, oldUser: User, newUser: User) => {
        await updateUser(newUser);
    }
}