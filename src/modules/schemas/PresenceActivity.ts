import { Schema } from 'mongoose';
import { PresenceActivity } from '../../interfaces';

const presenceActivitySchema = new Schema<PresenceActivity>({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: false, default: null },
    status: { type: String },
    clientStatus: {
        desktop: { type: String, required: false },
        mobile: { type: String, required: false },
        web: { type: String, required: false },
    }
}, {
    timestamps: true
});

export default presenceActivitySchema;