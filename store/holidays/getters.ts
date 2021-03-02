import { GetterTree } from 'vuex';

const getters: GetterTree<HolidaysStoreState, RootStoreState> = {
  getHolidayDates(state) {
    return state.holidays
  },

  getHolidayDocId(state) {
    return state.docId
  }
}

export default getters
