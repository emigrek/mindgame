import { Event } from "../interfaces";
import { deleteMessage } from "../modules/messages"

export const messageDeleteBulk: Event = {
    name: "messageDeleteBulk",
    run: async (client, messages, channel) => {
        for await (const message of messages) {
            if(message.author.id !== client.user?.id) continue;
            await deleteMessage(message.id);
        }
    }
}