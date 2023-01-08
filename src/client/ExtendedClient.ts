import { Client, Collection } from "discord.js";
import i18n from "i18n";
import { Event, Module, Interaction, Command, Button, Select, ContextMenu } from "../interfaces";

import events from "../events";
import modules from "../modules";
import interactions from "../interactions";
import commands from "../commands";
import buttons from "../buttons";
import selects from "../selects";
import contexts from "../contexts";

import config from "../utils/config";
import { join } from "path";
import moment from "moment";

class ExtendedClient extends Client {
    public events: Collection<string, Event> = new Collection();
    public modules: Collection<string, Module> = new Collection();
    public interactions: Collection<string, Interaction> = new Collection();
    public commands: Collection<string, Command> = new Collection();
    public buttons: Collection<string, Button> = new Collection();
    public selects: Collection<string, Select> = new Collection();
    public contexts: Collection<string, ContextMenu> = new Collection();

    public locales = [ "en", "pl-PL" ];
    public i18n = i18n;
    public numberFormat = Intl.NumberFormat('en', { notation: 'compact' });

    public async init() {
        process
            .on('unhandledRejection', (reason, p) => {
                console.error(reason, 'Unhandled Rejection at Promise', p);
            })
            .on('uncaughtException', err => {
                console.error(err, 'Uncaught Exception thrown');
                process.exit(1);
            });

        this.i18n.configure({
            locales: this.locales,
            directory: join(__dirname, "..", "translations"),
            defaultLocale: "en"
        });

        moment.locale("pl-PL");

        await this.loadModules();
        await this.loadContexts();
        await this.loadButtons();
        await this.loadSelects();
        await this.loadInteractions();
        await this.loadEvents();
        await this.loadSlashCommands();
        
        this.login(config.token).catch((err) => {
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

    public async loadSlashCommands() {
        for (const command of commands) {
            this.commands.set(command.data.name, command);
        }

        console.log("[SlashCommands] Loaded", this.commands.size);
    }

    public async loadButtons() {
        for (const button of buttons) {
            this.buttons.set(button.customId, button);
        }

        console.log("[Buttons] Loaded", this.buttons.size);
    }

    public async loadSelects() {
        for (const select of selects) {
            this.selects.set(select.customId, select);
        }

        console.log("[Selects] Loaded", this.selects.size);
    }
    
    public async loadInteractions() {
        for (const interaction of interactions) {
            this.interactions.set(interaction.customId, interaction);
        }

        console.log("[Interactions] Loaded", this.interactions.size);
    }

    public async loadContexts() {
        for (const context of contexts) {
            this.contexts.set(context.data.name, context);
        }

        console.log("[Contexts] Loaded", this.contexts.size);
    }
}

export default ExtendedClient;