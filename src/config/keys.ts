import { Keys } from "@/interfaces"

export const keys: Keys = {
    token: process.env.DISCORD_TOKEN ?? 'nil',
    mongoUri: process.env.MONGO_URI ?? 'nil',
    clientId: process.env.DISCORD_CLIENT_ID ?? 'nil',
    ownerId: process.env.OWNER_ID ?? 'nil'
};

if(Object.values(keys).includes('nil'))
    throw new Error('Missing environment variables');