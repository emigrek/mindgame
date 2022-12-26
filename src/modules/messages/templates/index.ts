import { BaseChannel, ChannelType, GuildMember } from "discord.js";
import { ImageHexColors } from "..";
import ExtendedClient from "../../../client/ExtendedClient";
import { Guild, User } from "../../../interfaces";
import { getUserRank } from "../../user";

const embedSpacer = () => {
    return `
        <html class="w-[550px] h-[20px] bg-[#2f3136] bg-transparent">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
        </html>
    `;
}

const layoutMedium = (html: string, colors?: ImageHexColors) => {
    return `
        <html class="w-[600px] h-[350px] ${colors ? `bg-gradient-to-b from-[${colors.Vibrant}] to-[${colors.DarkVibrant}]` : ''}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
                ${html}
            </body>
        </html>
    `;
}

const layoutLarge = (html: string, colors?: ImageHexColors) => {
    return `
        <html class="w-[700px] h-[350px] ${colors ? `bg-gradient-to-b from-[${colors.Vibrant}] to-[${colors.DarkVibrant}]` : ''}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
                ${html}
            </body>
        </html>
    `;
}

const guildConfig = async (client: ExtendedClient, sourceGuild: Guild, colors: ImageHexColors) => {
    const guild = await client.guilds.fetch(sourceGuild.guildId);
    const guildIcon = guild.iconURL({ extension: "png" });    

    return `
        <div class="flex flex-col items-center">
            <div class="mx-auto w-[400px] h-[200px] flex items-center justify-center align-middle space-x-10">
                <img src="${guildIcon}" class="w-26 h-26 rounded-full shadow-lg shadow-[${colors.DarkVibrant}]" />
                <div class="flex flex-col">
                    <div class="text-2xl text-white font-medium">${guild.name}</div>
                </div>
            </div>
            <div class="w-full h-[100px] flex text-white p-5">
            <div class="flex flex-row items-center justify-center align-middle text-white gap-3 mx-auto">
                <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                    <div class="flex space-x-2 items-center">
                            <div class="text-white/60">${client.i18n.__("config.membersField")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                    <path fill-rule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clip-rule="evenodd" />
                                    <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                                </svg>
                            </div>
                        </div>
                        <div class="text-4xl">${guild.members.cache.filter((member: GuildMember) => !member.user.bot).size}</div>
                    </div>
                    <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                        <div class="flex space-x-2 items-center">
                            <div class="text-white/60">${client.i18n.__("config.voiceChannelField")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                </svg>
                            </div>
                        </div>
                        <div class="text-4xl">${guild.channels.cache.filter((channel: BaseChannel) => channel.type == ChannelType.GuildVoice).size}</div>
                    </div>
                    <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                        <div class="flex space-x-2 items-center">
                            <div class="text-white/60">${client.i18n.__("config.textChannelField")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                    <path fill-rule="evenodd" d="M11.097 1.515a.75.75 0 01.589.882L10.666 7.5h4.47l1.079-5.397a.75.75 0 111.47.294L16.665 7.5h3.585a.75.75 0 010 1.5h-3.885l-1.2 6h3.585a.75.75 0 010 1.5h-3.885l-1.08 5.397a.75.75 0 11-1.47-.294l1.02-5.103h-4.47l-1.08 5.397a.75.75 0 01-1.47-.294l1.02-5.103H3.75a.75.75 0 110-1.5h3.885l1.2-6H5.25a.75.75 0 010-1.5h3.885l1.08-5.397a.75.75 0 01.882-.588zM10.365 9l-1.2 6h4.47l1.2-6h-4.47z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div class="text-4xl">${guild.channels.cache.filter((channel: BaseChannel) => channel.type == ChannelType.GuildText).size}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

const userProfile = async (client: ExtendedClient, user: User, colors: ImageHexColors, selfCall?: boolean) => {
    const userRank = await getUserRank(user); 

    return `
        <div class="flex flex-col items-center">
            <div class="mx-auto w-[400px] h-[200px] flex items-center justify-center align-middle space-x-10">
                <img src="${user.avatarUrl}" class="w-26 h-26 rounded-full shadow-lg shadow-[${colors.DarkVibrant}]" />
                <div class="flex flex-col">
                    <div class="text-2xl text-white font-medium">${user.tag.slice(0, -5)}</div>
                    <div class="flex flex-row items-center text-white/60">
                        <div>#</div>
                        <div>${user.tag.slice(-4)}</div>
                    </div>
                </div>
            </div>
            <div class="w-full h-[100px] flex text-white p-5">
                <div class="flex flex-row items-center justify-center align-middle text-white gap-3 mx-auto">
                    <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                        <div class="flex space-x-2 items-center">
                            <div class="text-white/60">${client.i18n.__("profile.rank")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                    <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.985z" />
                                </svg>
                            </div>
                        </div>
                        <div class="text-4xl">#${userRank}</div>
                    </div>
                    <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                        <div class="flex space-x-2 items-center">
                            <div class="text-white/60">${client.i18n.__("profile.level")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                    <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div class="text-4xl">${user.stats.level}</div>
                    </div>
                    <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                        <div class="flex space-x-2 items-center">
                            <div class="text-white/60">${client.i18n.__("profile.wins")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                    <path fill-rule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div class="text-4xl">${user.stats.games.won.skill + user.stats.games.won.skin}</div>
                    </div>
                    ${ selfCall ? `
                            <div class="flex items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                                <div class="flex space-x-2">
                                    <div>
                                        <div class="flex space-x-2 items-center">
                                            <div class="text-white/60">${client.i18n.__("profile.voice")}</div>
                                            <div>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="text-4xl">${Math.floor(user.stats.time.voice/3600).toFixed(2)}H</div>
                                    </div>
                                    <div>
                                        <div class="flex space-x-2 items-center">
                                            <div class="text-white/60">${client.i18n.__("profile.overall")}</div>
                                            <div>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="text-4xl">${Math.floor(user.stats.time.presence/3600).toFixed(2)}H</div>
                                    </div>
                                </div>
                            </div>
                        `
                    : '' }
                </div>
            </div>
        </div>
    `;
}


export { layoutLarge, layoutMedium, userProfile, guildConfig, embedSpacer };