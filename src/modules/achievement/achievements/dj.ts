import ExtendedClient from "@/client/ExtendedClient";
import { AchievementType, AchievementTypeContext } from "@/interfaces";
import { delay } from "@/utils/delay";
import { Message } from "discord.js";
import { AchievementManager } from "../structures/AchievementManager";
import { BaseAchievementContext } from "../structures/BaseAchievement";
import { GradualAchievement } from "../structures/GradualAchievement";

// Any short prefix with a symbol (!, ;;, m!, >>) or a bot mention, followed by "play"
export const playRegExp = /^(?:\w{0,2}[^\w\s]{1,2}|<@!?\d+>\s*)play\s/i;

// Time for the music bot to respond and join the voice channel
const verificationDelayMs = 10_000;

// User who requested a song: a bot's response to /play, or a user's text play command
export const getPlayRequester = (message: Message) => {
    if (!message.author.bot)
        return playRegExp.test(message.content.trim()) ? message.author : undefined;

    // message.interaction is deprecated, but interactionMetadata has no command name
    const interaction = message.interaction;
    return interaction?.commandName.toLowerCase() === "play" ? interaction.user : undefined;
};

export class DJ extends GradualAchievement<AchievementType.DJ> {
    emoji = "💽"
    emojiImage = "https://em-content.zobj.net/source/microsoft/74/minidisc_1f4bd.png";
    levels = [
        {
            value: 5,
            level: 1
        },
        {
            value: 10,
            level: 2
        },
        {
            value: 30,
            level: 3
        },
        {
            value: 60,
            level: 4
        },
        {
            value: 100,
            level: 5
        },
        {
            value: 200,
            level: 6
        },
        {
            value: 300,
            level: 7
        },
        {
            value: 500,
            level: 8
        },
        {
            value: 1000,
            level: 9
        }
    ];

    constructor(context?: BaseAchievementContext<AchievementType.DJ>) {
        super({
            context,
            achievementType: AchievementType.DJ
        });
    }

    // Counts only when a bot that responded to the request is in the requester's voice channel
    async progress(context: AchievementTypeContext[AchievementType.DJ]) {
        const { message } = context;
        if (!message.guild || !this.userId)
            return;

        const requester = await message.guild.members.fetch(this.userId);
        const voiceChannel = requester.voice.channel;
        if (!voiceChannel)
            return;

        const responders = message.author.bot
            ? [message.author.id]
            : await message.channel.messages.fetch({ after: message.id, limit: 20 })
                .then(messages => messages.filter(m => m.author.bot).map(m => m.author.id));

        if (!responders.some(id => voiceChannel.members.has(id)))
            return;

        await this.updatePayload({ messageCount: (this.payload?.messageCount || 0) + 1 });
        return this.reach(this.payload?.messageCount || 0);
    }
}

export const checkDJ = async (client: ExtendedClient, message: Message) => {
    const requester = getPlayRequester(message);
    if (!requester || requester.bot || !message.guild)
        return;

    // Waiting before the check, so the payload is read after the delay
    await delay(verificationDelayMs);
    new AchievementManager({ client, userId: requester.id, guildId: message.guild.id })
        .check(new DJ({ message }));
};
