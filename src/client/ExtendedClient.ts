import { Client, Collection } from "discord.js";
import i18n from "i18n";
import { Event, Module, Interaction } from "../interfaces";
import events from "../events";
import modules from "../modules/";
import interactions from "../interactions";
import config from "../utils/config";
import { join } from "path";

class ExtendedClient extends Client {
    public events: Collection<string, Event> = new Collection();
    public modules: Collection<string, Module> = new Collection();
    public interactions: Collection<string, Interaction> = new Collection();
    public i18n = i18n;

    public async init() {
        this.i18n.configure({
            locales: [ "en", "pl-PL" ],
            directory: join(__dirname, "..", "translations"),
            defaultLocale: "en"
        });

        await this.loadModules();
        await this.loadInteractions();
        await this.loadEvents();
        
        this.login(config.token)
            .catch((err) => {
                console.error("[Login] Error", err)
                process.exit(1);
            });
    }

    public async loadEvents() {
        for (const event of events) {
            this.events.set(event.name, event);
            this.on(event.name, event.run.bind(null, this));
        }

        console.log("[Events] Loaded", this.events.size);
    }

    public async loadModules() {
        for (const module of modules) {
            this.modules.set(module.name, module);
            await module.run(this);
        }

        console.log("[Modules] Loaded", this.modules.size);
    }
    
    public async loadInteractions() {
        for (const interaction of interactions) {
            this.interactions.set(interaction.customId, interaction);
        }

        console.log("[Interactions] Loaded", this.interactions.size);
    }
}

export default ExtendedClient;