import type {ActionTree} from 'vuex';

import EmployeesService from '~/services/employees-service';
import BridgeService from '~/services/bridge-service';

const EMPLOYEE_NOT_FOUND = 'employee_not_found';

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async getEmployee({commit, rootState}) {
    if (!rootState.auth.user) return;

    try {
      const employeesService = new EmployeesService(this.$fire, this.$fireModule);
      const {user} = rootState.auth;

      const employee = await employeesService.getEmployeeByMail(user.email);
      const isAdmin = await employeesService.isAdmin(user.email);

      if (!employee) throw new Error(EMPLOYEE_NOT_FOUND);

      // Retrieve BridgeUid if we haven't done this before
      if (!employee.bridgeUid) {
        const bridgeService = new BridgeService(this.$axios);
        employee.bridgeUid = await bridgeService.getMe();

        await employeesService.updateEmployee({
          ...employee!,
          bridgeUid: employee.bridgeUid,
          standBy: employee.standBy || false,
          billable: employee.billable,
        });
      }

      commit('setEmployee', {employee, isAdmin});
      commit('setIsFound', true);

      return employee;
    } catch (error) {
      if (error.message === EMPLOYEE_NOT_FOUND) {
        commit('setIsFound', false);
      } else {
        throw new Error(error);
      }
    }
  },
};

export default actions;
