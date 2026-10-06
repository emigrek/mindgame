import { inspect } from "util";

const clean = async (input: any, depth: number) => {
    if (input instanceof Promise)
        input = await input;
    
    if (typeof input !== `string`)
        input = inspect(input, { depth });

    input = input
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));

    // MONGO_URI carries the database password
    for (const [name, secret] of [["TOKEN", process.env.DISCORD_TOKEN], ["MONGO_URI", process.env.MONGO_URI]])
        if (secret) input = input.replaceAll(secret, `[${name}]`);

    return input;
};

export default clean;