import { Document } from "mongoose";
import { Event, User } from "../interfaces";
import { getUser } from "../modules/user";

export const userUsernameUpdate: Event = {
    name: "userUsernameUpdate",
    run: async (client, user, oldUsername, newUsername) => {
        const userSource = await getUser(user) as User & Document;
        if(!userSource) return;

        userSource.username = newUsername;
        await userSource.save();
    }
}