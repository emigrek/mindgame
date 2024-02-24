import { DeepPartial } from "@/interfaces"

function merge<T>(source: T, payload: DeepPartial<T>): T {
    for (const key in payload) {
        const sourceValue = source[key];
        const payloadValue = payload[key];

        if (!sourceValue) continue;

        if (typeof payloadValue === 'object' && payloadValue !== null && !Array.isArray(payloadValue)) {
            source[key] = merge(typeof sourceValue === 'object' && sourceValue !== null ? sourceValue : {}, payloadValue) as typeof sourceValue;
        } else if (typeof payloadValue === 'number' && typeof sourceValue === 'number') {
            source[key] = sourceValue + payloadValue as typeof sourceValue;
        } else if (typeof payloadValue === 'boolean') {
            source[key] = (payloadValue || sourceValue || false) as typeof sourceValue;
        } else if (payloadValue !== undefined) {
            source[key] = payloadValue as typeof sourceValue;
        }
    }
    return source;
}

export { merge };