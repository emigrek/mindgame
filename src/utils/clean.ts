import { inspect } from "util";

const clean = async (input: any, depth: number) => {
    if (input instanceof Promise)
        input = await input;
    
    if (typeof input !== `string`)
        input = inspect(input, { depth });

    input = input
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));

    input = input
        .replaceAll(process.env.DISCORD_TOKEN, "[TOKEN]")

    return input;
};

export default clean;