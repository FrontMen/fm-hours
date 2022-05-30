/* eslint-disable camelcase */
import type {ActionTree} from 'vuex';

const actions: ActionTree<RecordsStoreState, RootStoreState> = {
  async getMonthlyTimeInsights(
    {commit},
    payload: {employeeId: string; startDate: Date; endDate: Date}
  ) {
    console.log(payload.employeeId);
    if (!payload.employeeId || !payload.startDate?.getTime() || !payload.endDate?.getTime()) return;

    commit('setLoading', {isLoading: true});

    const timeRecords = await this.app.$timeRecordsService.getEmployeeRecords<TimeRecord>({
      employeeId: payload.employeeId,
      startDate: payload.startDate.getTime().toString(),
      endDate: payload.endDate.getTime().toString(),
    });

    commit('setLoading', {isLoading: false});
    commit('setInsights', {
      timeRecords,
    });

    console.log(this.app);
  },
};

export default actions;
