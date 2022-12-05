import { Config } from "../interfaces/Config"

const config: Config = {
    token: process.env.DISCORD_TOKEN ?? 'nil',
    mongoUri: process.env.MONGO_URI ?? 'nil'
};

if(Object.values(config).includes('nil'))
    throw new Error('Missing environment variables');

export default config;