import { Vibrant } from "node-vibrant/node";

interface ImageHexColors {
    Vibrant: string;
    DarkVibrant: string;
}

// Avatar URLs contain a content hash, so their colors never change. Every profile, ranking and /color render
// used to download and quantize the image again.
// ponytail: cleared when full instead of LRU, it only saves recomputation
const imageHexCache = new Map<string, ImageHexColors>();

const useImageHex = async (image: string | null): Promise<ImageHexColors> => {
    const defaultColors = { Vibrant: "#373b48", DarkVibrant: "#373b48" };

    if (!image)
        return defaultColors;

    const cached = imageHexCache.get(image);
    if (cached)
        return cached;

    // stale/missing avatar URLs 404 on the CDN; fall back instead of failing the whole interaction
    const colors = await Vibrant.from(image).getPalette().catch(() => null);

    // Not cached: a CDN hiccup shouldn't stick
    if (!colors || !colors.Vibrant || !colors.DarkVibrant)
        return defaultColors;

    if (imageHexCache.size >= 1000)
        imageHexCache.clear();
    const imageColors = {
        Vibrant: colors.Vibrant.hex,
        DarkVibrant: colors.DarkVibrant.hex
    };
    imageHexCache.set(image, imageColors);
    return imageColors;
}

const getColorInt = (color: string) => {
    return parseInt(color.slice(1), 16);
}

export { ImageHexColors, useImageHex, getColorInt };
