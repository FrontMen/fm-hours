import {ActionTree} from 'vuex';

const actions: ActionTree<HolidaysStoreState, RootStoreState> = {
  async getHolidays({commit}) {
    const {dates} = await this.app.$holidaysService.getHolidays();
    commit('setHolidays', {holidays: dates});
  },

  async addHoliday({commit}, payload: string) {
    const dates = await this.app.$holidaysService.saveHoliday(payload);
    commit('setHolidays', {holidays: dates});
  },

  async deleteHoliday({commit}, payload) {
    const dates = await this.app.$holidaysService.deleteHoliday(payload);
    commit('setHolidays', {holidays: dates});
  },
};

export default actions;
