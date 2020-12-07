import { isWithinInterval, isSameDay } from 'date-fns';
import { debounce } from '../helpers/debounce';

export const state = () => ({
    isLoggedin: undefined,
    isAdmin: undefined,
    user: undefined,
    time_records: [],
    lastSaved: undefined
});

const CreateHoursEntry = (date, hours) => {
    return { date: date, hours: hours }
}

const AddRecordToList = (allRecords, newRecord, transformation) => {
    let newRecords = [...allRecords];
    const record = newRecords.find((record) => newRecord.customer === record.customer && newRecord.project === record.project);
    const hours = CreateHoursEntry(newRecord.date, newRecord.hours);
    if (record) {
        const recordIndex = record.hours.findIndex((record) => isSameDay(new Date(record.date), new Date(newRecord.date)));
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

const debouncer = debounce((fn) => fn(), 2000);

export const actions = {
    async login () {
        let provider = new this.$fireModule.auth.GoogleAuthProvider();
        await this.$fire.auth.signInWithPopup(provider);
    },
    async onAuthStateChangedAction (context, { authUser, claims }) {
        if (authUser) {
            const usersRef = this.$fire.firestore.collection('users');
            const user = await usersRef.doc(claims.user_id).get();
            const snapshot = await this.$fire.firestore.collection('admins').get();
            const { admins: adminList } = snapshot.docs[0].data();
            const isAdmin = adminList.some((email) => email === claims.email);
            if (user.exists) {
                context.dispatch('loginSuccess', {id: user.id, ...user.data(), isAdmin});
            } else {
                const newUser = await usersRef.doc(claims.user_id).set({
                    name: claims.name,
                    picture: claims.picture,
                    time_records: [],
                    isAdmin
                });
                context.dispatch('loginSuccess', newUser.data());
            }
        } else {
            console.log('no user');
        }
    },
    loginSuccess (context, payload) {
        context.commit('loginSuccess', payload);
        setTimeout(() => {
            this.app.router.push('/hours');
        }, 500);
    },
    addHoursRecords (context, payload) {
        const timeRecords = context.getters.getTimeRecords;
        const newRecords = AddRecordToList(timeRecords, payload, transformToTimeEntryList);
        context.dispatch('saveToFirestore', { records: newRecords, debounce: true });
        context.commit('updateProjectRow', newRecords);
    },
    removeRecordRow (context, payload) {
        const {startDate, endDate} = context.rootGetters['week-dates/getcurrentWeekRange'];
        const timeRecords = context.getters.getTimeRecords;
        const newRecords = RemoveRow(
            timeRecords,
            payload,
            (entry) => !isWithinInterval(new Date(entry.date), { start: new Date(startDate), end: new Date(endDate)}),
            transformToTimeEntryList
        );
        context.dispatch('saveToFirestore', { records: newRecords, debounce: false });
        context.commit('updateProjectRow', newRecords);
    },
    async saveToFirestore (context, payload) {
        const { records, debounce } = payload;
        const saving = () => {
            const user = context.getters.getUser;
            const usersRef = this.$fire.firestore.collection('users').doc(user.id);
            usersRef.set({
                time_records: records
            }, { merge: true });
            context.commit('saveToFirestore');
        }
        if (debounce) {
            debouncer(() => saving());
        } else {
            saving();
        }
    },
    addProjectRow (context, payload) {
        context.commit('addProjectRow', payload);
    },
    logout (context) {
        this.$fire.auth.signOut();
        this.app.router.push('/');
        context.commit('logout');
    },
}

export const mutations = {
    loginSuccess: (state, payload) => {
        state.isLoggedin = true;
        state.user = payload;
        state.time_records = payload.time_records;
        state.isAdmin = payload.isAdmin;
    },
    addProjectRow: (state, payload) => {
        state.time_records = [...state.time_records, payload];
    },
    updateProjectRow: (state, payload) => {
        state.time_records = payload;
    },
    saveToFirestore: (state) => {
        state.lastSaved = new Date();
    },
    logout: (state) => {
        state.isLoggedin = false;
    },
}

export const getters = {
    getUser: state => {
        return state.user;
    },
    getIsAdmin: state => {
        return state.isAdmin;
    },
    getUserLoginStatus: state => {
        return state.isLoggedin;
    },
    getTimeRecords: (state) => {
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
    getWeekTotals: (state, getters, _, rootGetters) => {
        const currentWeek = rootGetters['week-dates/currentWeek'];
        const currentWeekRecords = getters.getTimeRecordsForCurrentWeek;
        return currentWeek.map((weekDay) => {
            const currDate = new Date(weekDay.date);
            return currentWeekRecords.reduce((acc, curr) => {
                const registeredHours = curr.hours.find((entry) => isSameDay(currDate, new Date(entry.date)));
                return acc + (registeredHours ? registeredHours.hours : 0);
            }, 0);
        });
    },
    getLastSavedDate: (state) => {
        return state.lastSaved;
    },
}