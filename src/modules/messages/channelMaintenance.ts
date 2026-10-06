import ExtendedClient from "@/client/ExtendedClient";
import i18n from "@/client/i18n";
import { config } from "@/config";
import { getQuickButtonsRows } from "@/modules/messages/buttons";
import { Collection, Message, TextChannel, VoiceBasedChannel } from "discord.js";

const sweepTextChannel = async (client: ExtendedClient, channel: TextChannel | VoiceBasedChannel) => {
    const messages = await channel.messages.fetch({ limit: 100 })
        .catch(e => {
            console.log(`There was an error when fetching messages: ${e}`)
            return new Collection<string, Message>();
        });

    const messagesToDelete = messages.filter((message: Message) => (
        config.emptyGuildSweepBotPrefixesList.some(prefix => message.content.startsWith(prefix)) || message.author.bot 
    ));

    // bulkDelete skips messages older than 14 days, those go one by one. One failed delete must not hide the rest.
    const bulkDeleted = await channel.bulkDelete(messagesToDelete, true)
        .catch(e => {
            console.log(`There was an error when bulk deleting messages: ${e}`);
            return new Collection<string, unknown>();
        });
    const results = await Promise.allSettled(
        messagesToDelete
            .filter((message: Message) => !bulkDeleted.has(message.id))
            .map((message: Message) => message.delete())
    );

    await attachQuickButtons(client, channel.id)
        .catch(e => console.log(`There was an error when attaching quick buttons: ${e}`));
    return bulkDeleted.size + results.filter(result => result.status === "fulfilled").length;
};

const attachQuickButtons = async (client: ExtendedClient, channelId: string) => {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased() || channel.isDMBased()) return;
    i18n.setLocale(channel.guild.preferredLocale);

    const lastMessages = await channel.messages.fetch({ limit: 100 })
        .catch(e => {
            console.log(`There was an error when fetching messages: ${e}`)
            return new Collection<string, Message>();
        });
    const clientMessages = lastMessages.filter(m => m.author.id === client.user?.id && !m.interactionMetadata);
    const lastMessage = clientMessages.first();
    if (!lastMessage) return;

    await Promise.all(
        clientMessages.map((message: Message) => {
            if (message.components.length > 0) 
                return message.edit({ components: [] });
        })
    )
        .catch(e => {
            console.log(`There was an error when clearing components: ${e}`);
        });

    await lastMessage.edit({ components: await getQuickButtonsRows() })
        .catch(e => {
            console.log(`There was an error when editing the message: ${e}`);
        });
};

export { sweepTextChannel, attachQuickButtons };
