export { Event } from "./Event";
export { Module } from "./Module";
export { User } from "./User";
export { Keys } from "./Keys";
export { Guild } from "./Guild";
export { Interaction } from "./Interaction";
export { PresenceActivity } from "./PresenceActivity";
export { VoiceActivity } from "./VoiceActivity";
export { Command } from "./Command";
export { Button } from "./Button";
export { Select } from "./Select";
export { SelectMenuOption } from "./SelectMenuOption";
export { ExtendedStatistics } from "./User";
export { Statistics } from "./User";
export { ContextMenu } from "./ContextMenu";
export { Message } from './Message';
export { Sorting } from './Sorting';
export { Follow } from './Follow';
export { Modal } from './Modal';
export { EphemeralChannel } from './EphemeralChannel';
export { ExperienceCalculatorConfig, VoiceModificator, PresenceModificator } from './ExperienceCalculatorConfig';
export { Config } from './Config';

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
};