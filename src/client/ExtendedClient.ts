import { Client, Collection, REST, Routes } from "discord.js";
import { Event, Module, Interaction, Command, Button, Select, ContextMenu, Modal } from "../interfaces";

import events from "../events";
import modules from "../modules";
import interactions from "../interactions";
import commands from "../commands";
import buttons from "../buttons";
import selects from "../selects";
import contexts from "../contexts";
import modals from "../modals";

import config from "../utils/config";
import moment from "moment";

import localeList from "./localeList";
import i18n from "./i18n";

class ExtendedClient extends Client {
    public events: Collection<string, Event> = new Collection();
    public modules: Collection<string, Module> = new Collection();
    public interactions: Collection<string, Interaction> = new Collection();
    public commands: Collection<string, Command> = new Collection();
    public buttons: Collection<string, Button> = new Collection();
    public selects: Collection<string, Select> = new Collection();
    public contexts: Collection<string, ContextMenu> = new Collection();
    public modals: Collection<string, Modal> = new Collection();

    public numberFormat = Intl.NumberFormat('en', { notation: 'compact' });

    public async init() {
        moment.locale("pl-PL");

        this.loadContexts();
        this.loadButtons();
        this.loadSelects();
        this.loadInteractions();
        this.loadEvents();
        this.loadSlashCommands();
        this.loadModals();

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

    public async loadModals() {
        for (const modal of modals) {
            this.modals.set(modal.customId, modal);
        }
    }

    public loadLocalizations() {
        for (const [name, command] of this.commands) {
            const { data } = command;
            for (const locale of localeList) {
                data.setNameLocalization(locale, i18n.__({ phrase: `commandLocalizations.${name}.name`, locale }))
                data.setDescriptionLocalization(locale, i18n.__({ phrase: `commandLocalizations.${name}.description`, locale }));

                data.options?.forEach((subcommand: any) => {
                    subcommand.setNameLocalization(locale, i18n.__({ phrase: `commandLocalizations.${name}.subcommand.${subcommand.name}.name`, locale }))
                    subcommand.setDescriptionLocalization(locale, i18n.__({ phrase: `commandLocalizations.${name}.subcommand.${subcommand.name}.description`, locale }));

                    subcommand.options?.forEach((option: any) => {
                        option.setNameLocalization(locale, i18n.__({ phrase: `commandLocalizations.${name}.option.${option.name}.name`, locale }))
                        option.setDescriptionLocalization(locale, i18n.__({ phrase: `commandLocalizations.${name}.option.${option.name}.description`, locale }));
                    })
                })
            }
        }

        for (const [name, context] of this.contexts) {
            for (const locale of localeList) {
                type Locale = 'en-US' | 'en-GB' | 'bg' | 'zh-CN' | 'zh-TW' | 'hr' | 'cs' | 'da' | 'nl' | 'fi' | 'fr' | 'de' | 'el' | 'hi' | 'hu' | 'it' | 'ja' | 'ko' | 'lt' | 'no' | 'pl' | 'pt-BR' | 'ro' | 'ru' | 'es-ES' | 'sv-SE' | 'th' | 'tr' | 'uk' | 'vi';
                context.data.setNameLocalization(locale as Locale, i18n.__({ phrase: `contextLocalizations.${name}`, locale }));
            }
        }
    }

    public async putSlashCommands() {
        this.loadLocalizations();

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