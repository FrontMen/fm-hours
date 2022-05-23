/* eslint-disable camelcase */
import type {ActionTree} from 'vuex';

const actions: ActionTree<RecordsStoreState, RootStoreState> = {
  async getMonthlyTimeRecords(
    {commit},
    payload: {employeeId: string; startDate: Date; endDate: Date}
  ) {
    if (!payload.employeeId || !payload.startDate?.getTime() || !payload.endDate?.getTime()) return;

    commit('setLoading', {isLoading: true}, {root: true});

    const timeRecords = await this.app.$timeRecordsService.getEmployeeRecords<TimeRecord>({
      employeeId: payload.employeeId,
      startDate: payload.startDate.getTime().toString(),
      endDate: payload.endDate.getTime().toString(),
    });

    commit('setLoading', {isLoading: false}, {root: true});
    commit('setRecords', {
      timeRecords,
    });
  },
};

export default actions;
