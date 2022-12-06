import { ActionRowBuilder, ChannelType, Client, Guild, StringSelectMenuBuilder, TextChannel, ThreadChannel } from "discord.js";

const sendMissingDefaultChannelMessage = (client: Client, guild: Guild) => {
    const textChannels = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText);
    const options = textChannels.map((channel) => {
        return {
            label: channel.name,
            description: `${channel instanceof ThreadChannel ? 0 : channel.members.size} watching this channel.`,
            value: channel.id
        }
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("defaultChannelSelect")
                .setPlaceholder("Select text channel.")
                .addOptions(options)
        );
    
    const communicationChannel = textChannels.first() as TextChannel || client.users.cache.get(guild.ownerId);
    
    if(!communicationChannel) return;

    communicationChannel.send({
        content: "Please select a default channel for this server.",
        components: [row]
    });
}


export { sendMissingDefaultChannelMessage };