import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, ...args: any[]): Promise<void>;
}

export interface Event {
    name: string;
    run: Run;
}