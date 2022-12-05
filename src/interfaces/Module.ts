import Client from "../client/ExtendedClient";

interface Run {
    (client: Client, ...args: any[]): Promise<void>;
}

export interface Module {
    name: string;
    run: Run;
}