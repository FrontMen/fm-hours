import { isSameDay, isWithinInterval } from 'date-fns'

export function isSameRecord(record, recordToCompare) {
    return isSameDay(new Date(record.date), new Date(recordToCompare.date)) && record.customer === recordToCompare.customer
}

export function getRecordsForWeekRange(records, startDate, endDate) {
    return records.filter((entry) =>
        isWithinInterval(new Date(entry.date), {
            start: new Date(startDate),
            end: new Date(endDate),
        })
    );
};