import { isWithinInterval } from 'date-fns';
import { debounce } from '../helpers/debounce';

export const state = () => ({
    isLoggedin: undefined,
    user: undefined,
    time_records: [],
});

const CreateHoursEntry = (date, hours) => {
    return { date: date, hours: hours }
}

const AddRecordToList = (allRecords, newRecord, transformation) => {
    let newRecords = [...allRecords];
    const record = newRecords.find((record) => newRecord.customer === record.customer && newRecord.project === record.project);
    const hours = CreateHoursEntry(newRecord.date, newRecord.hours);
    if (record) {
        const recordIndex = record.hours.findIndex((record) => record.date === newRecord.date);
        if (recordIndex === -1) {
            record.hours.push(hours);
        } else {
            record.hours[recordIndex] = hours;
        }
    } else {
        newRecords.push(
            {
                customer: newRecord.customer,
                project: newRecord.project,
                hours: [hours]
            }
        );
    }
    return transformation ? transformation(newRecords) : newRecords;
}

const RemoveRow = (allRecords, newRecord, hoursCondition, transformation) => {
    let newRecords = [...allRecords];
    const recordIndex = newRecords.findIndex((record) => newRecord.customer === record.customer && newRecord.project === record.project);
    const project = {
        ...newRecords[recordIndex],
        hours: newRecords[recordIndex].hours.filter(hoursCondition)
    };
    newRecords[recordIndex] = project;
    return transformation ? transformation(newRecords) : newRecords;
}

const transformToTimeEntryList = (entries) => {
    return entries.reduce((acc, curr) => {
        return [
            ...acc,
            ...curr.hours.map((entry) => {
                return {
                    customer: curr.customer,
                    project: curr.project,
                    date: entry.date,
                    hours: entry.hours
                }
            })
        ]
    }, []);
}

const debouncer = debounce((fn) => fn(), 2000)

export const actions = {
    async onAuthStateChangedAction (context, { authUser, claims }) {
        if (authUser) {
            const usersRef = this.$fire.firestore.collection('users');
            const user = await usersRef.doc(claims.user_id).get();
            if (user.exists) {
                context.dispatch('loginSuccess', {id: user.id, ...user.data()});
            } else {
                const newUser = await usersRef.doc(claims.user_id).set({
                    name: claims.name,
                    time_records: []
                });
                context.dispatch('loginSuccess', newUser.data());
            }
        } else {
            console.log('no user');
        }
    },
    loginSuccess (context, payload) {
        context.commit('loginSuccess', payload);
    },
    addHoursRecords (context, payload) {
        const timeRecords = context.getters.getTimeRecords;
        const newRecords = AddRecordToList(timeRecords, payload, transformToTimeEntryList);
        context.dispatch('updateToDb', newRecords);
    },
    removeRecordRow (context, payload) {
        const {startDate, endDate} = context.rootGetters['week-dates/getcurrentWeekRange'];
        const timeRecords = context.getters.getTimeRecords;
        const newprojects = RemoveRow(
            timeRecords,
            payload,
            (entry) => !isWithinInterval(new Date(entry.date), { start: new Date(startDate), end: new Date(endDate)}),
            transformToTimeEntryList
        );
        context.dispatch('updateToDb', newprojects);
        context.commit('removeProjectRow', newprojects);
    },
    async updateToDb (context, payload) {
        debouncer(() => {
            console.log('updating firestore');
            const user = context.getters.getUser;
            const usersRef = this.$fire.firestore.collection('users').doc(user.id);
            usersRef.set({
                time_records: payload
            }, { merge: true });
        });
    },
    addProjectRow (context, payload) {
        context.commit('addProjectRow', payload);
    },
}

export const mutations = {
    loginSuccess: (state, payload) => {
        state.isLoggedin = true;
        state.user = payload;
        state.time_records = payload.time_records
        console.log('payload, payload', state);
    },
    addProjectRow: (state, payload) => {
        state.time_records = [...state.time_records, payload];
    },
    removeProjectRow: (state, payload) => {
        state.time_records = payload;
    },
}

export const getters = {
    getUser: state => {
      return state.user
    },
    getTimeRecords: (state, getters, rootState, rootGetters) => {
        return state.time_records.reduce((acc, entry) => {
            let record = acc.find((a) => a.customer === entry.customer && a.project === entry.project);
            if(!record) {
              record = {
                customer: entry.customer,
                project: entry.project,
                hours: []
              }
              acc.push(record);
            }
            record.hours.push({
              date: entry.date, hours: entry.hours
            });
            return acc;
          }, []);
    },
    getTimeRecordsForCurrentWeek: (state, getters, _, rootGetters) => {
        const timeRecords = getters.getTimeRecords;
        const {startDate, endDate} = rootGetters['week-dates/getcurrentWeekRange'];
        const rows = timeRecords.filter((record) => {
            return record.hours.some((entry) => isWithinInterval(new Date(entry.date), { start: new Date(startDate), end: new Date(endDate)}))
        });
        return rows;
    },
}

// week
