import { GuildMember, Presence } from "discord.js";
import ExtendedClient from "../../client/ExtendedClient";

import presenceActivitySchema from "../schemas/PresenceActivity";
import { PresenceActivity } from "../../interfaces";
import mongoose from "mongoose";

const PresenceActivityModel = mongoose.model("PresenceActivity", presenceActivitySchema);

const startPresenceActivity = async (client: ExtendedClient, member: GuildMember, newStatus: Presence) => {
    const presenceActivity = new PresenceActivityModel({
        userId: member.id,
        from: new Date(),
        status: newStatus.status,
        clientStatus: newStatus.clientStatus
    });
    await presenceActivity.save();
    return presenceActivity;
};

const endPresenceActivity = async (client: ExtendedClient, member: GuildMember, oldStatus: Presence) => {
    const presenceActivity = await PresenceActivityModel.findOne({ userId: member.id, to: null });
    if(!presenceActivity) return new Error("PresenceActivity not found");

    presenceActivity.to = new Date();
    presenceActivity.status = oldStatus.status;

    await presenceActivity.save();
    return presenceActivity;
};

export { startPresenceActivity, endPresenceActivity, PresenceActivityModel };