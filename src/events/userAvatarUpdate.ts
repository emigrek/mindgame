import { Document } from "mongoose";
import { Event, User } from "../interfaces";
import { getUser } from "../modules/user";

export const userAvatarUpdate: Event = {
    name: "userAvatarUpdate",
    run: async (client, user, oldAvatarURL, newAvatarURL) => {
        const userSource = await getUser(user) as User & Document;
        if(!userSource) return;

        userSource.avatarUrl = newAvatarURL;
        await userSource.save();
    }
}