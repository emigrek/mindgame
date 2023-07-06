import ExtendedClient from "@/client/ExtendedClient";
import { Event } from "@/interfaces";
import { updateUser } from "@/modules/user";
import { User } from "discord.js";

export const userDiscriminatorUpdate: Event = {
    name: "userDiscriminatorUpdate",
    run: async (client: ExtendedClient, user: User) => {
        await updateUser(user);
    }
}