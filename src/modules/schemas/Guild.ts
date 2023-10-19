import { Schema, Document } from 'mongoose';
import { Guild } from '@/interfaces';

export type GuildDocument = Guild & Document;

const channelId = { type: String, default: null };
const reqString = { type: String, required: true };

const guildSchema = new Schema<Guild>({
    guildId: reqString,
    channelId: channelId,
    notifications: { type: Boolean, default: true },
    autoSweeping: { type: Boolean, default: true },
    levelRoles: { type: Boolean, default: false },
    levelRolesHoist: { type: Boolean, default: false }
});

export default guildSchema;