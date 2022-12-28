export interface UserGuildActivityDetails {
    guildId: string;
    userId: string;
    time: {
        voice: number;
    }
}