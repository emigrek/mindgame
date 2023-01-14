import { Event } from "../interfaces";
import { deleteMessage } from "../modules/messages"

export const messageDelete: Event = {
    name: "messageDelete",
    run: async (client, message) => {
        if(message.author.id !== client.user?.id) return;

        await deleteMessage(message.id);
    }
}