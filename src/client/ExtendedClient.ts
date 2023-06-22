import { Client, Collection, REST, Routes } from "discord.js";
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

    public locales = ["en-US", "pl"];
    public i18n = i18n;
    public numberFormat = Intl.NumberFormat('en', { notation: 'compact' });

    public async init() {
        this.i18n.configure({
            locales: this.locales,
            directory: join(__dirname, "..", "translations"),
            defaultLocale: "en-US",
            objectNotation: true
        });

        moment.locale("pl-PL");

        this.loadContexts();
        this.loadButtons();
        this.loadSelects();
        this.loadInteractions();
        this.loadEvents();
        this.loadSlashCommands();

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
    }

    public async loadModules() {
        for (const module of modules) {
            this.modules.set(module.name, module);
            await module.run(this);
        }
    }

    public async loadSlashCommands() {
        for (const command of commands) {
            this.commands.set(command.data.name, command);
        }
    }

    public async loadButtons() {
        for (const button of buttons) {
            this.buttons.set(button.customId, button);
        }
    }

    public async loadSelects() {
        for (const select of selects) {
            this.selects.set(select.customId, select);
        }
    }

    public async loadInteractions() {
        for (const interaction of interactions) {
            this.interactions.set(interaction.customId, interaction);
        }
    }

    public async loadContexts() {
        for (const context of contexts) {
            this.contexts.set(context.data.name, context);
        }
    }

    public async putSlashCommands() {
        const rest = new REST({ version: '10' }).setToken(config.token);
        const commandsData = this.commands.map(command => command.data.toJSON());
        const contextsData = this.contexts.map(context => context.data.toJSON());
        const data = commandsData.concat(contextsData);

        return await rest.put(
            Routes.applicationCommands(config.clientId),
            {
                body: data
            },
        );
    }
}

export default ExtendedClient;