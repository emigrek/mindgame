import { PresenceActivityDocument } from "@/modules/schemas/PresenceActivity";
import { VoiceActivityDocument } from "@/modules/schemas/VoiceActivity";

import { config } from "@/config";
import { ActivityStreak } from "@/interfaces";
import { getWarsawDay } from "@/utils/date";
import { computeStreaks } from "./streak";
import { voiceActivityModel, presenceActivityModel } from "./models";

interface GetVoiceActivityProps {
    userId: string;
    guildId: string;
}
const getVoiceActivity = async ({ userId, guildId }: GetVoiceActivityProps): Promise<VoiceActivityDocument | null> => {
    return voiceActivityModel.findOne({ userId, guildId, to: null });
};
// Time since the member's last finished session in this guild, for Comeback (counted per guild)
const getGuildVoiceBreakMs = async (userId: string, guildId: string): Promise<number | null> => {
    const last = await voiceActivityModel.findOne({ userId, guildId, to: { $ne: null } }).sort({ to: -1 });
    return last?.to ? Date.now() - last.to.getTime() : null;
};
const getLastVoiceActivity = async (userId: string): Promise<VoiceActivityDocument | null> => {
    return voiceActivityModel.findOne({ userId }).sort({ to: -1 });
};
const getLastUserVoiceActivity = async (userId: string): Promise<VoiceActivityDocument | null> => {
    const entries = await voiceActivityModel.aggregate([
        {
            $match: {
                userId
            }
        },
        {
            $sort: {
                createdAt: -1,
            }
        },
        {
            $limit: 1
        }
    ]);
    
    return entries[0];
};
const getPresenceActivity = async (userId: string, guildId: string): Promise<PresenceActivityDocument | null> => {
    return presenceActivityModel.findOne({ userId: userId, guildId: guildId, to: null });
}
const getLastUserPresenceActivity = async (userId: string): Promise<PresenceActivityDocument | null> => {
    const entries = await presenceActivityModel.aggregate([
        {
            $match: {
                userId
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 1
        }
    ]);
    
    return entries[0];
};
interface VoiceActivityDocumentWithSeconds extends VoiceActivityDocument {
    seconds: number;
}
interface PresenceActivityDocumentWithSeconds extends PresenceActivityDocument {
    seconds: number;
}
interface VoiceActivitiesByChannelId {
    _id: string;
    activities: VoiceActivityDocumentWithSeconds[];
}
interface PresenceActivitiesByGuildId {
    _id: string;
    activities: PresenceActivityDocumentWithSeconds[];
}
const getVoiceActivitiesByChannelId = async (): Promise<VoiceActivitiesByChannelId[]> => {
    return voiceActivityModel.aggregate([
        {
            $match: {
                to: null
            }
        },
        {
            $addFields: {
                seconds: {
                    $round: [
                        {
                            $divide: [
                                { $subtract: [new Date(), "$from"] },
                                1000
                            ]
                        },
                        0
                    ]
                }
            },
        },
        {
            $group: {
                _id: "$channelId",
                activities: { $push: "$$ROOT" }
            }
        }
    ]);
}
const getPresenceActivitiesByGuildId = async (): Promise<PresenceActivitiesByGuildId[]> => {
    return presenceActivityModel.aggregate([
        {
            $match: {
                to: null
            }
        },
        {
            $addFields: {
                seconds: {
                    $round: [
                        {
                            $divide: [
                                { $subtract: [new Date(), "$from"] },
                                1000
                            ]
                        },
                        0
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$guildId",
                activities: { $push: "$$ROOT" }
            }
        }
    ]);
}
const getUserClientsTime = async (userId: string): Promise<PresenceActivityDocumentWithSeconds[]> => {
    return presenceActivityModel.aggregate([
        {
            $match: {
                userId,
                to: { $ne: null }
            }
        },
        {
            $addFields: {
                seconds: {
                    $round: [
                        {
                            $divide: [
                                { $subtract: ["$to", "$from"] },
                                1000
                            ]
                        },
                        0
                    ]
                }
            }
        },
        {
            $sort: {
                from: -1
            }
        }
    ]);
}
const getUserVoiceActivityStreak = async (userId: string, guildId: string): Promise<ActivityStreak> => {
    // Distinct Warsaw days with a voice session, grouped in Mongo instead of loading every session
    const days = await voiceActivityModel.aggregate<{ _id: string }>([
        { $match: { userId, guildId } },
        { $group: { _id: { $dateToString: { date: "$from", format: "%Y-%m-%d", timezone: "Europe/Warsaw" } } } },
        { $sort: { _id: 1 } },
    ]);

    const { streak, maxStreak } = computeStreaks(days.map(day => day._id), getWarsawDay(new Date()));
    return config.voiceActivityStreakLogic({ streak, maxStreak });
};
const getUserLastGuildVoiceActivity = async (userId: string, guildId: string): Promise<VoiceActivityDocument | undefined> => {
    const query = await voiceActivityModel.aggregate([
        {
            $match: {
                userId,
                guildId,
                to: { $ne: null }
            }
        },
        {
            $sort: {
                from: -1
            }
        },
        {
            $limit: 1
        }
    ]);
    return query.at(0);
};
const getLastChannelVoiceActivity = async (userId: string, channelId: string): Promise<VoiceActivityDocument | undefined> => {
    const query = await voiceActivityModel.aggregate([
        {
            $match: {
                userId: {
                    $ne: userId
                },
                channelId,
                to: null
            }
        },
        {
            $sort: {
                from: -1
            }
        },
        {
            $limit: 1
        }
    ]);
    return query.at(0);
};
const getGuildActiveVoiceActivities = async (guildId: string): Promise<VoiceActivityDocument[]> => {
    return voiceActivityModel.find({ guildId, to: null });
}

export { getVoiceActivity, getGuildVoiceBreakMs, getLastVoiceActivity, getLastUserVoiceActivity, getPresenceActivity, getLastUserPresenceActivity, getVoiceActivitiesByChannelId, getPresenceActivitiesByGuildId, getUserClientsTime, getUserVoiceActivityStreak, getUserLastGuildVoiceActivity, getLastChannelVoiceActivity, getGuildActiveVoiceActivities };
export type { VoiceActivityDocumentWithSeconds, PresenceActivityDocumentWithSeconds, VoiceActivitiesByChannelId, PresenceActivitiesByGuildId };
