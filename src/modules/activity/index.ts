// Split by responsibility; re-exports the module's public API
export { voiceActivityModel } from "./models";
export { checkGuildVoiceEmpty, endGuildActivities, endPresenceActivity, endVoiceActivity, startPresenceActivity, startVoiceActivity } from "./sessions";
export { closeStalePresenceActivities, closeStaleVoiceActivities, openMissingActivities, touchActivities, validatePresenceActivities, validateVoiceActivities } from "./reconcile";
export { getLastChannelVoiceActivity, getLastUserPresenceActivity, getGuildVoiceBreakMs, getLastUserVoiceActivity, getLastVoiceActivity, getPresenceActivitiesByGuildId, getPresenceActivity, getUserVoiceActivityStreak, getVoiceActivitiesByChannelId, getVoiceActivity } from "./queries";
export type { PresenceActivitiesByGuildId, PresenceActivityDocumentWithSeconds, VoiceActivitiesByChannelId, VoiceActivityDocumentWithSeconds } from "./queries";
export { clientStatusToEmoji, formatLastActivityDetails, getPresenceClientStatus, getUserClients, getUserLastActivityDetails } from "./clients";
