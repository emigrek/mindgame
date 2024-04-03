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