import { isSameDay, subDays } from "date-fns";

import { formatDate, addDays } from "~/helpers/dates";
import { debounce } from "~/helpers/debounce";

import { recordStatus } from "~/helpers/record-status";
import {
  isSameRecord,
  getRecordsForWeekRange,
  generateWeeklyValuesForTable,
  changeStatusOfRecords,
} from "~/helpers/records";

export const state = () => ({
  isLoggedin: undefined,
  isAdmin: undefined,
  user: undefined,
  time_records: [],
  lastSaved: undefined,
  travelAllowance_records: [],
});

const debouncer = debounce((fn) => fn(), 2000);
const AddRecord = (allRecords, newRecord, findCondition) => {
  const newRecords = [...allRecords];
  const recordIndex = newRecords.findIndex(findCondition);
  if (recordIndex > -1) {
    // if record exist but is now 0, remove from array
    if (newRecord.hours === 0) {
      newRecords.splice(recordIndex, 1);
    } else {
      newRecords[recordIndex] = newRecord;
    }
  } else {
    newRecords.push(newRecord);
  }
  return newRecords;
};

export const actions = {
  async login() {
    const provider = new this.$fireModule.auth.GoogleAuthProvider();
    await this.$fire.auth.signInWithPopup(provider);
  },
  async onAuthStateChangedAction(context, { authUser, claims }) {
    if (authUser) {
      const usersRef = this.$fire.firestore.collection("users");
      const user = await usersRef.doc(claims.user_id).get();
      const snapshot = await this.$fire.firestore.collection("admins").get();
      const { admins: adminList } = snapshot.docs[0].data();
      const isAdmin = adminList.some((email) => email === claims.email);
      context.dispatch("holidays/getHolidays", null, { root: true });
      if (user.exists) {
        context.dispatch("loginSuccess", {
          id: user.id,
          ...user.data(),
          isAdmin,
        });
      } else {
        const newUser = await usersRef.doc(claims.user_id).set({
          name: claims.name,
          picture: claims.picture,
          time_records: [],
          isAdmin,
        });
        context.dispatch("loginSuccess", newUser.data());
      }
    }
  },
  loginSuccess(context, payload) {
    context.commit("loginSuccess", payload);
    context.commit("week-dates/setToday", null, { root: true });
  },
  addHoursRecords(context, payload) {
    const records = context.getters.getTimeRecords;
    const newRecords = AddRecord(records, payload, (entry) =>
      isSameRecord(entry, payload)
    );
    context.dispatch("saveToFirestore", {
      dataToSave: { time_records: newRecords },
      debounce: true,
    });
    context.commit("updateTimeRecords", newRecords);
  },
  removeRecordRow(context, payload) {
    const allRecords = context.getters.getTimeRecords;
    const newRecords = allRecords.filter(
      (record) =>
        !payload.values.some(
          (entry) =>
            isSameDay(new Date(entry.date), new Date(record.date)) &&
            record.customer === payload.customer
        )
    );
    context.dispatch("saveToFirestore", {
      dataToSave: { time_records: newRecords },
      debounce: false,
    });
    context.commit("updateTimeRecords", newRecords);
  },
  submitRecordsForApproval(context) {
    const allRecords = context.getters.getTimeRecords;
    const recordsToUpdate = context.getters.getTimeRecordsForCurrentWeek;
    const newRecords = changeStatusOfRecords(
      allRecords,
      recordsToUpdate,
      recordStatus.PENDING
    );
    context.dispatch("saveToFirestore", {
      dataToSave: { time_records: newRecords },
      debounce: false,
    });
    context.commit("updateTimeRecords", newRecords);
  },
  addProjectRow(context, payload) {
    context.commit("addProjectRow", payload);
  },
  copyPrevWeekrecords(context) {
    const records = context.getters.getTimeRecords;
    const currentWeek = context.rootGetters["week-dates/currentWeek"];
    const startDate = subDays(new Date(currentWeek[0].date), 7);
    const endDate = addDays(startDate, 6);
    const prevWeekRows = getRecordsForWeekRange(records, startDate, endDate);
    if (prevWeekRows.length === 0) {
      return;
    }
    const copiedRecords = prevWeekRows.map((entry) => {
      return {
        ...entry,
        date: formatDate(addDays(entry.date, 7)),
        status: recordStatus.NEW,
      };
    });
    const newRecords = [...records, ...copiedRecords];
    context.commit("updateTimeRecords", newRecords);
    context.dispatch("saveToFirestore", {
      dataToSave: { time_records: newRecords },
      debounce: false,
    });
  },
  addKilometers(context, payload) {
    const records = context.getters.getTravelAllowanceRecords;
    const newRecords = AddRecord(records, payload, (entry) =>
      isSameDay(new Date(payload.date), new Date(entry.date))
    );
    context.commit("updateTravelAllowanceRecords", newRecords);
    context.dispatch("saveToFirestore", {
      dataToSave: { travelAllowance_records: newRecords },
      debounce: true,
    });
  },
  async saveToFirestore(context, payload) {
    const { dataToSave, debounce } = payload;
    const saving = () => {
      const user = context.getters.getUser;
      const usersRef = this.$fire.firestore.collection("users").doc(user.id);
      usersRef.set(dataToSave, { merge: true });
      context.commit("saveToFirestore");
    };
    if (debounce) {
      await debouncer(() => saving());
    } else {
      await saving();
    }
  },
  logout(context) {
    this.$fire.auth.signOut();
    this.app.router.push("/");
    context.commit("logout");
  },
};

export const mutations = {
  loginSuccess: (state, payload) => {
    state.isLoggedin = true;
    state.user = payload;
    state.time_records = payload.time_records;
    state.travelAllowance_records = payload.travelAllowance_records || [];
    state.isAdmin = payload.isAdmin;
  },
  addProjectRow: (state, payload) => {
    state.time_records = [...state.time_records, payload];
  },
  updateTimeRecords: (state, payload) => {
    state.time_records = payload;
  },
  updateTravelAllowanceRecords: (state, payload) => {
    state.travelAllowance_records = payload;
  },
  saveToFirestore: (state) => {
    state.lastSaved = new Date();
  },
  logout: (state) => {
    state.isLoggedin = false;
    state.isAdmin = false;
    state.user = undefined;
  },
};

export const getters = {
  getUser: (state) => {
    return state.user;
  },
  isUserAdmin: (state) => {
    return state.isAdmin;
  },
  isUserLoggedIn: (state) => {
    return state.isLoggedin;
  },
  getTimeRecords: (state) => {
    return state.time_records;
  },
  getTravelAllowanceRecords: (state) => {
    return state.travelAllowance_records;
  },
  /* eslint-disable @typescript-eslint/no-unused-vars */
  getTimeRecordsForCurrentWeek: (state, getters, _, rootGetters) => {
    const records = getters.getTimeRecords;
    const { startDate, endDate } = rootGetters[
      "week-dates/getCurrentWeekRange"
    ];
    return getRecordsForWeekRange(records, startDate, endDate);
  },
  getWeeklyTimesheet: (state, getters, _, rootGetters) => {
    const currentWeek = rootGetters["week-dates/currentWeek"];
    const records = getters.getTimeRecordsForCurrentWeek;
    return generateWeeklyValuesForTable(records, currentWeek);
  },
  currentWeekIsReadOnly: (_, getters) => {
    const records = getters.getTimeRecordsForCurrentWeek;
    return records.some(
      (r) =>
        r.status === recordStatus.PENDING || r.status === recordStatus.APPROVED
    );
  },
  getWeeklyKilometers: (state, getters, _, rootGetters) => {
    const records = getters.getTravelAllowanceRecords;
    const currentWeek = rootGetters["week-dates/currentWeek"];
    const { startDate, endDate } = rootGetters[
      "week-dates/getCurrentWeekRange"
    ];

    const rows = getRecordsForWeekRange(records, startDate, endDate);
    return [
      {
        customer: "Kilometers",
        values: currentWeek.map((day) => {
          const result = rows.find((r) => r.date === day.date);
          return {
            date: day.date,
            value: result?.hours || 0,
          };
        }),
      },
    ];
  },
  getLastSavedDate: (state) => {
    return state.lastSaved;
  },
};
