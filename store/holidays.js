import { compareAsc, isSameDay } from "date-fns";
import { formatDate } from "~/helpers/dates";

export const state = () => ({
  holidays: [],
  docId: undefined,
});

export const actions = {
  async getHolidays(context) {
    const holidays = await this.$fire.firestore.collection("holidays").get();
    const { dates: holidaysList } = holidays.docs[0].data();
    context.commit("setHolidayDocId", holidays.docs[0].id);
    context.commit("setHolidays", holidaysList);
  },
  async addHoliday(context, payload) {
    const allDates = context.getters.getHolidayDates;
    const docId = context.getters.getHolidayDocId;
    const newDates = [...allDates, formatDate(payload)].sort((accDate, currDate) =>
      compareAsc(new Date(accDate), new Date(currDate))
    );
    const ref = this.$fire.firestore.collection("holidays").doc(docId);
    await ref.set({ dates: newDates });
    context.commit("setHolidays", newDates);
  },
  async deleteHoliday(context, payload) {
    const allDates = context.getters.getHolidayDates;
    const newDates = allDates.filter(
      (date) => !isSameDay(new Date(date), new Date(payload))
    );
    const docId = context.getters.getHolidayDocId;
    const ref = this.$fire.firestore.collection("holidays").doc(docId);
    await ref.set({ dates: newDates });
    context.commit("setHolidays", newDates);
  },
};

export const mutations = {
  setHolidays(state, payload) {
    state.holidays = payload;
  },
  setHolidayDocId(state, payload) {
    state.docId = payload;
  },
};

export const getters = {
  getHolidayDates: (state) => {
    return state.holidays;
  },
  getHolidayDocId: (state) => {
    return state.docId;
  },
};
