import moment from "moment/moment";

export const getLocalizedDateTypeRange = (type: 'day' | 'week' | 'month') => {
    const startOf = moment().startOf(type);
    const endOf = moment().endOf(type);

    if (type === 'day') {
        return `(${startOf.format('DD/MM')})`;
    }

    if (type === 'week') {
        return startOf.month() === endOf.month() ?
            `(${startOf.format('DD')}-${endOf.format('DD/MM')})` :
            `(${startOf.format('DD/MM')}-${endOf.format('DD/MM')})`;
    }

    return `(${startOf.format('DD')}-${endOf.format('DD')}/${startOf.format('MM')})`;
};

export const getLocalizedDateRange = (start: string | Date, end: string | Date) => {
    const startOf = moment(start);
    const endOf = moment(end);

    if (startOf.isSame(endOf, 'day')) {
        return `(${startOf.format('DD/MM')})`;
    }

    if (startOf.isSame(endOf, 'month')) {
        return `(${startOf.format('DD')}-${endOf.format('DD/MM')})`;
    }

    if (startOf.isSame(endOf, 'year')) {
        return `(${startOf.format('DD/MM')}-${endOf.format('DD/MM')})`;
    }

    return `(${startOf.format('DD/MM/YYYY')}-${endOf.format('DD/MM/YYYY')})`;
};

export const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;

    const minutes = Math.floor(ms / 60_000);
    const hours = Math.floor(minutes / 60);
    if (!hours) return `${minutes}m`;
    return hours < 24 ? `${hours}h ${minutes % 60}m` : `${Math.floor(hours / 24)}d ${hours % 24}h`;
};

const warsawHourFormat = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Warsaw" });
const warsawDayFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Warsaw" });

export const getWarsawHour = (date: Date | number) => Number(warsawHourFormat.format(date));

// YYYY-MM-DD calendar day in Europe/Warsaw. Built from parts, so it doesn't depend on a locale's date pattern.
export const getWarsawDay = (date: Date | number) => {
    const parts = Object.fromEntries(warsawDayFormat.formatToParts(date).map(({ type, value }) => [type, value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
};

const hour = 60 * 60 * 1000;

// Part of [from, to) between 0:00 and 5:00 Europe/Warsaw. Its offsets are whole hours, so stepping by UTC hours is exact.
export const getNightMs = (from: Date, to: Date) => {
    let ms = 0;
    for (let t = from.getTime(); t < to.getTime();) {
        const next = Math.min((Math.floor(t / hour) + 1) * hour, to.getTime());
        if (getWarsawHour(t) < 5)
            ms += next - t;
        t = next;
    }
    return ms;
};
