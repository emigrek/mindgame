import { Document } from "mongoose";
import { Event, User } from "../interfaces";
import { getUser } from "../modules/user";

export const userDiscriminatorUpdate: Event = {
    name: "userDiscriminatorUpdate",
    run: async (client, user, oldDiscriminator, newDiscriminator) => {
        const userSource = await getUser(user) as User & Document;
        if(!userSource) return;

        userSource.discriminator = newDiscriminator;
        await userSource.save();
    }
}