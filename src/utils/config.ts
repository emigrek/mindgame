import { Config } from "../interfaces"

const config: Config = {
    token: process.env.DISCORD_TOKEN ?? 'nil',
    mongoUri: process.env.MONGO_URI ?? 'nil',
    clientId: process.env.DISCORD_CLIENT_ID ?? 'nil'
};

if(Object.values(config).includes('nil'))
    throw new Error('Missing environment variables');

export default config;