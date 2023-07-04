import { BaseChannel, ChannelType, GuildMember, ImageURLOptions } from "discord.js";
import { ImageHexColors } from "@/modules/messages/index";
import ExtendedClient from "@/client/ExtendedClient";
import { ActivityPeakDay, ActivityPeakHour, getPresenceActivityBetween, getPresenceActivityColor, getShortWeekDays, getUserPresenceActivity, getUserVoiceActivity, getVoiceActivityBetween, getActivePeaks } from "@/modules/activity/index";
import { getLevelRoleTreshold } from "@/modules/roles";
import { getUserRank, levelToExp } from "@/modules/user";
import moment from "moment";
import chroma from "chroma-js";
import { UserDocument } from "@/modules/schemas/User";
import { GuildDocument } from "@/modules/schemas/Guild";
import i18n from "@/client/i18n";
import { getFollowers } from "@/modules/follow";

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
        <html class="w-[700px] h-[350px] ${colors ? `bg-gradient-to-b from-[${colors.Vibrant}] to-[${colors.DarkVibrant}]` : ''}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="w-full h-full flex items-center justify-center align-middle">
                ${html}
            </body>
        </html>
    `;
}

const layoutLarge = (html: string, colors?: ImageHexColors) => {
    return `
        <html class="w-[500px] h-[500px] ${colors ? `bg-gradient-to-b from-[${colors.Vibrant}] to-[${colors.DarkVibrant}]` : ''}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="w-full h-full flex items-center justify-center align-middle">
                ${html}
            </body>
        </html>
    `;
}

const layoutXLarge = (html: string, colors?: ImageHexColors) => {
    return `
        <html class="w-[800px] h-[800px] ${colors ? `bg-gradient-to-b from-[${colors.Vibrant}] to-[${colors.DarkVibrant}]` : ''}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="w-full h-full flex items-center justify-center align-middle">
                ${html}
            </body>
        </html>
    `;
}

const getStatisticsTable = (data: ActivityPeakDay[], locale: string, colors: ImageHexColors) => {
    const days = getShortWeekDays(locale);
    const chromaColor = chroma(colors.Vibrant);
    const daysLayout = [1, 2, 3, 4, 5, 6, 0];

    const exclusedDays = data.filter((d) => d.activePeak > 0);

    let dataMinPeakDay: ActivityPeakDay;
    if(exclusedDays.length > 0) 
        dataMinPeakDay = exclusedDays.reduce((prev, current) => (prev.activePeak < current.activePeak) ? prev : current);
    else
        dataMinPeakDay = data.reduce((prev, current) => (prev.activePeak < current.activePeak) ? prev : current);
    
    let dataMinPeakHour: ActivityPeakHour;
    const dataMinPeakExcludedHours = dataMinPeakDay.hours.filter((h) => h.activePeak > 0);
    if(dataMinPeakExcludedHours.length > 0)
        dataMinPeakHour = dataMinPeakExcludedHours.reduce((prev, current) => (prev.activePeak < current.activePeak) ? prev : current);
    else
        dataMinPeakHour = dataMinPeakDay.hours.reduce((prev, current) => (prev.activePeak < current.activePeak) ? prev : current);
       
    const dataMaxPeakDay = data.reduce((prev, current) => (prev.activePeak > current.activePeak) ? prev : current); 
    const dataMaxPeakHour = dataMaxPeakDay.hours.reduce((prev, current) => (prev.activePeak > current.activePeak) ? prev : current);

    const hoursTh = () => {
        return Array(24).fill(0).map((_, i) => {
            return `<th>${i}</th>`;
        }).join('');
    }

    const daysTr = () => {
        let tr = '';

        daysLayout.forEach((n) => {
            tr += `
                <tr>
                    <td class="text-sm text-white/30">${days[n]}</td>
                    ${dayTd(n)}
                </tr>
            `;
        });

        return tr;
    }

    const daySquare = (day: ActivityPeakDay, hour: number) => {
        if(!day || !day.hours[hour] || !day.hours[hour].activePeak || !day.activePeak) {
            return `<div class="text-center w-7 h-7 bg-white/5" style="opacity: 5%"></div>`;  
        }

        const activityHour: ActivityPeakHour = day.hours[hour];
        const hourAlpha = Math.round((activityHour.activePeak/day.activePeak) * 100);
        const hourColor = chromaColor.luminance(hourAlpha/100).rgba().join(',');

        return `
            <div 
                class="text-center bg-[${colors.Vibrant}] w-7 h-7 text-black/30 font-bold text-sm flex items-center justify-center"
                style="background-color: rgba(${hourColor});"
            >
                ${activityHour.activePeak}
            </div>
        `;
    }

    const dayTd = (day: number) => {
        const dayPeak = data.find((dayStat: ActivityPeakDay) => dayStat.day === day)!;

        return Array(24).fill(0).map((_, i) => {
            return `
                <td class="m-0 p-0 w-7 h-7">${daySquare(dayPeak, i)}</td>
            `
        }).join('');
    }

    return `
        <div class="w-full flex-col items-center justify-center">
            <table class="text-white/50 border-none border-0" cellspacing="0" cellpadding="0">
                <thead class="font-medium m-0 p-0">
                    <tr>
                        <th></th>
                        ${hoursTh()}
                    </tr>
                </thead>
                <tbody class="font-medium m-0 p-0">
                    ${daysTr()}
                </tbody>
            </table>
            <div class="w-full text-white/40 space-x-1 flex items-center justify-end py-1 px-1">
                <div class="flex flex items-center justify-center space-x-1">
                    <div>min</div>
                    ${daySquare(dataMinPeakDay, dataMinPeakHour.hour)}
                </div>
                <div class="flex flex items-center justify-center space-x-1">
                    ${daySquare(dataMaxPeakDay, dataMaxPeakHour.hour)}
                    <div>max</div>
                </div>
            </div>
        </div>
    `;
}

const guildConfig = async (client: ExtendedClient, sourceGuild: GuildDocument, colors: ImageHexColors) => {
    const guild = await client.guilds.fetch(sourceGuild.guildId);
    const guildIcon = guild.iconURL({ dynamic: false, extension: "png", forceStatic: true } as ImageURLOptions);    

    return `
        <div class="flex flex-col items-center space-y-3">
            <div class="mx-auto w-[400px] flex items-center justify-center align-middle space-x-10 mb-7">
                ${
                    guildIcon ? 
                        `<img src="${guildIcon}" class="w-26 h-26 rounded-full shadow-lg shadow-[${colors.DarkVibrant}]" />` 
                    : 
                        ''
                }
                <div class="flex flex-col">
                    <div class="text-2xl text-white font-medium">${guild.name}</div>
                </div>
            </div>
            <div class="w-full h-[100px] flex items-center text-white p-5">
                <div class="flex flex-row items-center justify-center align-middle text-white gap-4 mx-auto">
                    <div class="flex text-lg flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                        <div class="flex flex-grow space-x-2 items-center">
                                <div class="text-white/80">${i18n.__("config.membersField")}</div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                        <path fill-rule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clip-rule="evenodd" />
                                        <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="text-4xl">${guild.members.cache.filter((member: GuildMember) => !member.user.bot).size}</div>
                        </div>
                        <div class="flex flex-grow flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                            <div class="flex space-x-2 items-center">
                                <div class="text-white/80">${i18n.__("config.voiceChannelField")}</div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="text-4xl">${guild.channels.cache.filter((channel: BaseChannel) => channel.type == ChannelType.GuildVoice).size}</div>
                        </div>
                        <div class="flex flex-grow flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                            <div class="flex space-x-2 items-center">
                                <div class="text-white/80">${i18n.__("config.textChannelField")}</div>
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
        </div>
    `;
}

const userProfile = async (client: ExtendedClient, user: UserDocument, colors: ImageHexColors, selfCall?: boolean) => {
    const userRank = await getUserRank(user);
    const first = userRank == 1;

    const expToCurrentLevel = levelToExp(user.stats.level);
    const expToLevelUp = levelToExp(user.stats.level+1);
    const expProcentage = (((user.stats.exp-expToCurrentLevel)/(expToLevelUp-expToCurrentLevel))*100).toFixed();
    const userTreshold = getLevelRoleTreshold(user.stats.level);

    const voiceActivity = await getUserVoiceActivity(user);
    const voiceActivityGuild = voiceActivity ? client.guilds.cache.get(voiceActivity.guildId) : null;
    const active = voiceActivity ? true : false;

    const presenceActivity = await getUserPresenceActivity(user);
    const presenceActivityColor = getPresenceActivityColor(presenceActivity);

    const followers = await getFollowers(user.userId).then(followers => followers.length);

    return `
        <div class="flex flex-col items-center space-y-3">
            <div class="mx-auto w-[400px] flex items-center justify-center align-middle space-x-10 mb-7">
                <div class="relative">
                    <img 
                        src="${user.avatarUrl}" 
                        class="
                            w-28 h-28 rounded-full shadow-lg shadow-[${colors.DarkVibrant}]
                            ${active ? 'ring-4 ring-green-600' : '' } 
                        " 
                    />
                    <span class="bottom-1 right-2 absolute w-6 h-6 bg-[${presenceActivityColor}] rounded-full"></span>
                </div> 
                <div class="flex flex-col">
                    <div class="text-xl text-white font-semibold">${user.username}</div>
                    ${ voiceActivityGuild ? 
                        `
                        <div class="flex items-center mt-2">
                            <div class="text-white flex items-center space-x-2 p-1 px-2 rounded-full bg-green-600">
                                <img 
                                    src="${voiceActivityGuild.iconURL({ extension: "png", size: 512 })}" 
                                    class="
                                        w-6 h-6 rounded-full shadow-lg
                                    " 
                                />
                                <div class="text-sm">${
                                    voiceActivityGuild.name.length > 16 ?
                                        voiceActivityGuild.name.slice(0, 16) + '...' 
                                    :
                                        voiceActivityGuild.name
                                }</div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 fill-green-500">
                                        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        ` : ''
                    }
                </div>
            </div>
            <div class="w-full h-[125px] flex items-center text-white">
                <div class="flex w-full text-lg flex-row items-center justify-center align-middle text-white space-x-3">
                    <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                        <div class="flex space-x-2 items-center">
                            <div class="text-white/80 text-base">${i18n.__("profile.rank")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                    <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.985z" />
                                </svg>
                            </div>
                        </div>
                        <div class="flex items-center justify-center space-x-2 text-4xl">
                            ${ first ? `
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" class="w-6 h-6 shadow-[#eab308] fill-[#eab308]"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86.4 427.4c5.5 30.4 32 52.6 63 52.6H426.6c30.9 0 57.4-22.1 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z"/></svg>
                            ` : ''}
                            <div class="text-4xl">#${userRank}</div>
                        </div>
                    </div>
                    <div class="relative flex-grow flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-xl">
                        <div class="flex space-x-2 items-center">
                            <div class="text-white/80 text-lg">${i18n.__("profile.level")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
                                    <path fill-rule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div class="w-full flex flex-col space-y-2 items-center justify-center">
                            <div class="text-5xl font-bold text-[${userTreshold.color}]">
                                ${user.stats.level}
                            </div>  
                            <div class="relative w-11/12 h-3 bottom-0 flex rounded-lg bg-black/80 overflow-hidden">
                                <div class="absolute w-full h-full flex items-center justify-center">
                                     <div class="relative w-7 h-full rounded-full bg-black/30 flex items-center justify-center">
                                        <div class="text-[0.6rem] text-white text-center font-bold">${expProcentage}%</div>
                                    </div>
                                </div>
                                <div style="width: ${expProcentage}%;border-radius: 9999px;" class="h-full flex items-center justify-center bg-[${userTreshold.color}] overflow-hidden shadow-lg"></div> 
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col items-center px-4 py-3 rounded-xl bg-[#202225] shadow-md">
                        <div class="flex space-x-2 items-center">
                            <div class="text-white/80 text-base">${i18n.__("profile.followers")}</div>
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                </svg>
                            </div>
                        </div>
                        <div class="text-4xl">${followers}</div>
                    </div>
                </div>
            </div>
            ${ selfCall || user.stats.time.public ? `
                            <div class="w-full relative flex flex-col space-y-1 px-4 py-3 items-center rounded-xl shadow-md bg-[#202225] ${user.stats.time.public ? 'opacity-100' : 'opacity-70'}">
                                <div class="flex flex-row flex-grow space-x-6 items-center justify-center">
                                    <div class="flex flex-col items-center p-2 justify-center">
                                        <div class="flex space-x-2 items-center">
                                            <div class="text-white/80 text-base">${i18n.__("profile.voice")}</div>
                                            <div>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="text-4xl text-white">${Math.round(user.stats.time.voice/3600)}H</div>
                                    </div>
                                    <div class="flex flex-col items-center p-2 justify-center">
                                        <div class="flex space-x-2 items-center">
                                            <div class="text-white/80 text-base">${i18n.__("profile.overall")}</div>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                                                <path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z" clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                        <div class="text-4xl text-white">${Math.round(user.stats.time.presence/3600)}H</div>
                                    </div>
                                </div>
                            </div>
                        `
            : '' }
            ${ selfCall && !user.stats.time.public ? `
                <div class="w-full p-1 text-center flex items-center justify-center text-white opacity-50">
                    <div>${ i18n.__("profile.visibilityNotification") }</div>
                </div>
            ` : '' }
        </div>
    `;
}

const guildStatistics = async (client: ExtendedClient, sourceGuild: GuildDocument, colors: ImageHexColors) => {
    const guild = client.guilds.cache.get(sourceGuild.guildId)!;
    const guildIconUrl = guild.iconURL({ extension: "png", size: 512 });

    const startWeek = moment().startOf("week").toDate();
    const endWeek = moment().endOf("week").subtract(1, "second").toDate();

    const voiceActivityData = await getVoiceActivityBetween(sourceGuild, startWeek, endWeek);
    const voiceActivityPeaks = await getActivePeaks(voiceActivityData);
    
    const presenceActivityData = await getPresenceActivityBetween(sourceGuild, startWeek, endWeek);
    const presenceActivityPeaks = await getActivePeaks(presenceActivityData);
    
    return `
        <div class="flex flex-col items-center">
            <div class="w-full bg-[#202225]/90 rounded-t-lg text-slate-50 py-4 px-5 space-x-2 flex items-center justify-between align-middle">
                <div class="text-2xl">${i18n.__("statistics.voiceHeader")}</div>
                <div class="flex p-2 items-center justify-center rounded-full bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 fill-white">
                        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                    </svg>              
                </div>
            </div>
            <div class="w-full rounded-b-lg h-[275px] shadow-lg text-white p-3 bg-[#202225]/70 flex items-center justify-center align-middle backdrop-blur-3xl">
                ${ getStatisticsTable(voiceActivityPeaks, guild.preferredLocale, colors) }
            </div>
            <div class="mt-2 w-full rounded-t-lg bg-[#202225]/90 text-slate-50 py-4 px-5 space-x-2 flex items-center justify-between align-middle">
                <div class="text-2xl">${i18n.__("statistics.presenceHeader")}</div>
                <div class="flex p-2 items-center justify-center rounded-full bg-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                    </svg>    
                </div>
            </div>
            <div class="w-full h-[275px] rounded-b-lg shadow-lg text-white p-3 bg-[#202225]/70 flex items-center justify-center align-middle backdrop-blur-3xl">
                ${ getStatisticsTable(presenceActivityPeaks, guild.preferredLocale, {
                    DarkVibrant: "#3d679f",
                    Vibrant: "#3c94dc",
                }) }
            </div>
            <div class="mt-2 w-full text-white/60 py-2 px-5 space-x-3 flex flex-row text-center items-center justify-center align-middle">
                <img src="${guildIconUrl}" class="w-8 h-8 rounded-full" />
                <div class="text-xl">${moment(startWeek).format("DD.MM.YYYY")} - ${moment(endWeek).format("DD.MM.YYYY")}</div>
            <div>
        </div>
    `;
}


export { layoutLarge, layoutMedium, userProfile, guildConfig, embedSpacer, guildStatistics, layoutXLarge };