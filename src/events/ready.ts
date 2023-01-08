import ExtendedClient from "../client/ExtendedClient";
import { Event, User } from "../interfaces";
import { REST, RESTPostAPIApplicationCommandsJSONBody, Routes, TextChannel } from 'discord.js';
import { updatePresence } from "../modules/presence/";

import config from "../utils/config";
import { getUser } from "../modules/user";
import { Document } from "mongoose";

const restPutRes = async (client: ExtendedClient) => {
    const rest = new REST({ version: '10' }).setToken(config.token);
    const commandsData = client.commands.map(command => command.data.toJSON()) as RESTPostAPIApplicationCommandsJSONBody[];;
    const contextsData = client.contexts.map(context => context.data.toJSON()) as RESTPostAPIApplicationCommandsJSONBody[];;
    const data = commandsData.concat(contextsData) as RESTPostAPIApplicationCommandsJSONBody[];
    
    await rest.put(
        Routes.applicationCommands(config.clientId),
        { 
            body: data
        },
    );
}


export const ready: Event = {
    name: "ready",
    run: async (client) => {
        console.log(`[ready] Logged in as`, client.user?.tag);
        console.log(`[ready] Serving`, client.guilds.cache.size, `guilds`);
        
        await updatePresence(client);
        //await restPutRes(client);

        const migratedUsers = [
            {
              userId: "300219621129322497",
              time: 134738
            },
            {
              userId: "301806103849598978",
              time: 102327
            },
            {
              userId: "278155043729965057",
              time: 67754
            },
            {
              userId: "214208382888837121",
              time: 111784
            },
            {
              userId: "148861037129498625",
              time: 120485
            },
            {
              userId: "277159574723887105",
              time: 95651
            },
            {
              userId: "275653402585726985",
              time: 99612
            },
            {
              userId: "196997055737102337",
              time: 115813
            },
            {
              userId: "561468040609267724",
              time: 53891
            },
            {
              userId: "196346135269474304",
              time: 17478
            },
            {
              userId: "706944904609398915",
              time: 21553
            },
            {
              userId: "273381195562221568",
              time: 32304
            },
            {
              userId: "276375431337345025",
              time: 21251
            },
            {
              userId: "322777316969152512",
              time: 16811
            },
            {
              userId: "314386960905011202",
              time: 8782
            },
            {
              userId: "297443748416323594",
              time: 7458
            },
            {
              userId: "530836395984551952",
              time: 5092
            },
            {
              userId: "268819650035318784",
              time: 19355
            },
            {
              userId: "438708731232911382",
              time: 2598
            },
            {
              userId: "409842924721799190",
              time: 871
            },
            {
              userId: "253925661838671883",
              time: 418
            },
            {
              userId: "253917500067020801",
              time: 262
            },
            {
              userId: "400795599127183361",
              time: 250
            },
            {
              userId: "414503236226121739",
              time: 392
            },
            {
              userId: "526693669517000714",
              time: 389
            },
            {
              userId: "482850263812538398",
              time: 47
            },
            {
              userId: "435455808357138440",
              time: 111
            },
            {
              userId: "229333369417105408",
              time: 132
            },
            {
              userId: "282191675680489472",
              time: 57
            },
            {
              userId: "934856781782470726",
              time: 0
            },
            {
              userId: "755087741427122237",
              time: 0
            },
            {
              userId: "333263770170163201",
              time: 65
            },
            {
              userId: "825086019388047400",
              time: 22
            },
            {
              userId: "560203131766439956",
              time: 591
            },
            {
              userId: "334440929769291776",
              time: 0
            },
            {
              userId: "271271479612669952",
              time: 0
            },
            {
              userId: "533351315607257108",
              time: 14
            },
            {
              userId: "357508110589362187",
              time: 0
            },
            {
              userId: "818621291736072273",
              time: 0
            },
            {
              userId: "418455064126947331",
              time: 0
            },
            {
              userId: "329591619865018369",
              time: 1409
            },
            {
              userId: "271675430874906624",
              time: 94
            },
            {
              userId: "713381405186588824",
              time: 0
            },
            {
              userId: "632687468222873623",
              time: 0
            },
            {
              userId: "514191453589864459",
              time: 0
            },
            {
              userId: "273827399978844160",
              time: 0
            },
            {
              userId: "674006735211593728",
              time: 0
            },
            {
              userId: "708246190122205264",
              time: 126
            },
            {
              userId: "272210874830422017",
              time: 423
            },
            {
              userId: "697100188086435901",
              time: 106
            },
            {
              userId: "842942775443849237",
              time: 0
            },
            {
              userId: "312403172117184512",
              time: 40
            },
            {
              userId: "303178996143751168",
              time: 74
            },
            {
              userId: "309355240275181570",
              time: 357
            },
            {
              userId: "464323388043821057",
              time: 379
            },
            {
              userId: "719894645374582877",
              time: 248
            },
            {
              userId: "426736672118669342",
              time: 13
            },
            {
              userId: "447690526221795348",
              time: 148
            },
            {
              userId: "343552370204213258",
              time: 72
            },
            {
              userId: "909101907178586233",
              time: 0
            }
        ];

        migratedUsers.forEach(async (user) => {
            const guildUser = await client.users.fetch(user.userId);
            const sourceUser = await getUser(guildUser) as User & Document;

            sourceUser.stats.time.presence += user.time;

            await sourceUser?.save();
        });
    }
}