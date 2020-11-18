import { addDays, subDays, getMonth, getYear, startOfISOWeek, format } from 'date-fns';

export const state = () => ({
    currentDate: new Date(),
});

export const mutations = {
    nextWeek(state) {
        const startDate = startOfISOWeek(new Date(state.currentDate));
        state.currentDate = addDays(new Date(startDate), 7);
    },
    prevWeek(state) {
        const startDate = startOfISOWeek(new Date(state.currentDate));
        state.currentDate = subDays(new Date(startDate), 7);
    },
}

export const getters = {
    currentWeekLabel: state => {
        const startDate = startOfISOWeek(new Date(state.currentDate));
        const endDate = addDays(startDate, 4);
        let label = format(startDate, 'dd');
        if (getMonth(startDate) !== getMonth(endDate)) {
            label += ` ${format(startDate, 'MMM')}`;

            if (getYear(startDate) !== getYear(endDate)) {
                label += ` ${format(startDate, 'yyyy')}`;
            }
        }
        label += ` - ${format(endDate, 'dd MMM yyyy')}`;
        return label;
    },
    currentWeek: state => {
        const startDate = startOfISOWeek(new Date(state.currentDate));
        return [...Array(5)].map((_, index) => {
            const newDate = addDays(new Date(startDate), index);
            return {
                date: newDate,
                weekDay: format(newDate, 'EEEEEE'),
                monthDay: format(newDate, 'dd'),
                month: format(newDate, 'MMM')
            }
        });
    },
}