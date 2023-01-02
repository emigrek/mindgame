import { Event } from "../interfaces";

export const error: Event = {
    name: "error",
    run: async (client, error) => {
        console.log("[error] encountered an error: ", error);
    }
}