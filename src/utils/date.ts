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
    return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
