import type {ActionTree} from 'vuex';

import EmployeesService from '~/services/employees-service';
import BridgeService from '~/services/bridge-service';

const EMPLOYEE_NOT_FOUND = 'employee_not_found';

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async get({commit, rootState}) {
    if (!rootState.auth.user) return;

    try {
      const employeesService = new EmployeesService(this.$fire, this.$fireModule);
      const {user} = rootState.auth;

      const employee = await employeesService.getByMail(user.email);

      if (!employee) throw new Error(EMPLOYEE_NOT_FOUND);

      // Retrieve BridgeUid if we haven't done this before
      if (!employee.bridgeUid) {
        const bridgeService = new BridgeService(this.$axios);
        employee.bridgeUid = await bridgeService.getMe();

        await employeesService.update({
          ...employee!,
          bridgeUid: employee.bridgeUid,
          standBy: employee.standBy || false,
          billable: employee.billable,
        });
      }

      commit('set', {employee});
      commit('isFound', true);

      return employee;
    } catch (error) {
      if (error instanceof Error && error.message === EMPLOYEE_NOT_FOUND) {
        commit('isFound', false);
      } else {
        throw error;
      }
    }
  },
};

export default actions;
