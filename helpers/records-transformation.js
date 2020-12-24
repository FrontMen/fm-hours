export const transformRecordsToUIFormat = (records) => {
    return records.reduce((acc, entry) => {
        let record = acc.find((a) => a.customer === entry.customer);
        if (!record) {
            record = {
                customer: entry.customer,
                hours: [],
                debtor: entry.debtor,
            };
            acc.push(record);
        }
        record.hours.push({
            date: entry.date,
            hours: entry.hours,
        });
        return acc;
    }, []);
}