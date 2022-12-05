import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Event, Module } from "../interfaces";
import events from "../events";
import modules from "../modules";
import config from "../utils/config";

class ExtendedClient extends Client {
    public events: Collection<string, Event> = new Collection();
    public modules: Collection<string, Module> = new Collection();

    public async init() {
        this.login(config.token)
            .catch((err) => {
                console.error("[Login] Error", err)
                process.exit(1);
            });

        this.loadEvents();
        this.loadModules();
    }

    public async loadEvents() {
        for (const event of events) {
            this.events.set(event.name, event);
            this.on(event.name, event.run.bind(null, this));
        }

        console.log("[Events] Loaded ", this.events.size);
    }

    public async loadModules() {
        for (const module of modules) {
            this.modules.set(module.name, module);
            module.run(this);
        }

        console.log("[Modules] Loaded ", this.modules.size);
    }
}

export default ExtendedClient;