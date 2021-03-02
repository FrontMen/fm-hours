import { compareAsc, isSameDay } from "date-fns";
import { ActionTree } from "vuex";

import { formatDate } from "~/helpers/dates";

const actions: ActionTree<HolidaysStoreState, RootStoreState> = {
  async getHolidays({ commit }) {
    const result = await this.$fire.firestore.collection("holidays").get();
    const { dates } = result.docs[0].data();

    commit("setHolidays", { holidays: dates });
    commit("setHolidayDocId", { docId: result.docs[0].id });
  },

  async addHoliday({ commit, getters }, payload: string) {
    const allDates = getters.getHolidayDates;
    const newDates: string[] = [...allDates, formatDate(payload)];

    const sortedDates = newDates.sort((accDate, currDate) =>
      compareAsc(new Date(accDate), new Date(currDate))
    );

    const docId = getters.getHolidayDocId;
    const ref = this.$fire.firestore.collection("holidays").doc(docId);

    await ref.set({ dates: sortedDates });
    commit("setHolidays", { holidays: newDates });
  },

  async deleteHoliday({ commit, getters }, payload) {
    const allDates: string[] = getters.getHolidayDates;
    const newDates = allDates.filter(
      (date) => !isSameDay(new Date(date), new Date(payload))
    );

    const docId = getters.getHolidayDocId;
    const ref = this.$fire.firestore.collection("holidays").doc(docId);

    await ref.set({ dates: newDates });
    commit("setHolidays", { holidays: newDates });
  },
};

export default actions;
