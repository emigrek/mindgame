// Registers slash commands and context menus globally. Run after adding or changing a command:
//   npm run deploy-commands              (registers)
//   npm run deploy-commands -- --dry-run (lists what would be registered, sends nothing)
import "dotenv/config";
import ExtendedClient from "@/client/ExtendedClient";

const main = async () => {
    const client = new ExtendedClient({ intents: [] });
    await client.loadSlashCommands();
    await client.loadContexts();

    const names = [...client.commands.keys(), ...client.contexts.keys()];
    if (process.argv.includes("--dry-run")) {
        // Builds the localized payload, so missing or invalid translations fail here instead of at Discord
        client.loadLocalizations();
        const payload = [...client.commands.values(), ...client.contexts.values()].map(({ data }) => data.toJSON());
        console.log(`Would register: ${names.join(", ")} (${JSON.stringify(payload).length} bytes)`);
        return;
    }

    await client.putSlashCommands();
    console.log(`Registered ${client.commands.size} commands and ${client.contexts.size} context menus: ${names.join(", ")}`);
};

main().then(() => process.exit(0), error => {
    console.error(error);
    process.exit(1);
});
