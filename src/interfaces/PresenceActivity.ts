export interface PresenceActivity {
    userId: string;
    from: Date;
    to: Date | null;
    status: string;
    clientStatus?: {
        desktop?: string;
        mobile?: string;
        web?: string;
    }
}