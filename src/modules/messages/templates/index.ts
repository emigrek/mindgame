import { Client, Guild } from "discord.js";
import ExtendedClient from "../../../client/ExtendedClient";

const guildTemplate = (guild: Guild) => {
    return `
        <div class="w-full flex space-x-4 items-center justify-center align-middle text-white/70 text-xl">
            <div>${guild.name}</div>
            <img src="${guild.iconURL()}" class="w-16 h-16 rounded-full shadow-lg border-4 border-[#3691a3]" />
            <div class="flex space-x-1 items-center justify-center">
                <div>${guild.members.cache.size}</div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clip-rule="evenodd" />
                    <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                </svg>
            </div>
        </div>
    `;
};

const layoutMedium = (html: string, accent?: boolean) => {
    return `
        <html class="w-[600px] h-[200px] bg-transparent">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
                ${accent ? `<div class="absolute z-10 top-0 left-0 h-full w-[10px] bg-gradient-to-b from-[#00295d] via-[#3691a3] to-[#082659]"></div>` : "" }
                ${html}
            </body>
        </html>
    `;
}

const layoutLarge = (html: string, accent?: boolean) => {
    return `
        <html class="w-[1300px] h-[500px] bg-transparent">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
                ${accent ? `<div class="absolute z-10 top-0 left-0 h-full w-[10px] bg-gradient-to-b from-[#00295d] via-[#3691a3] to-[#082659]"></div>` : "" }
                ${html}
            </body>
        </html>
    `;
}

const headerTemplate = (html: string) => {
    return layoutMedium(html, true);
}

const configHeader = (client: ExtendedClient) => {
    return `
        <div class="w-full flex items-center px-8 py-4 justify-between text-white space-x-3">
            <div class="flex flex-col">
                <div class="text-2xl font-bold">Config</div>
                <div class="flex text-md items-center justify-center text-white/50">
                    ${client.i18n.__("config.headerSubtitle")}
                </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 bg-white/5 p-2 rounded-xl ">
                <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            </svg>
        </div>
    `;
}

export { headerTemplate, layoutLarge, layoutMedium, guildTemplate, configHeader };