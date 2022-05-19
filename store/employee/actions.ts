import type {ActionTree} from 'vuex';

import EmployeesService from '~/services/employees-service';
import {generateAvatarURL} from '~/helpers/employee';
import BridgeService from '~/services/bridge-service';

import {Errors} from '~/types/enums';

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async getEmployee({commit, rootState}) {
    if (!rootState.auth.user) return;

    try {
      const employeesService = new EmployeesService(this.$fire);
      const {user} = rootState.auth;

      const employee = await employeesService.getEmployeeByMail(user.email);
      const isAdmin = await employeesService.isAdmin(user.email);

      if (!employee) throw new Error(Errors.EMPLOYEE_NOT_FOUND);

      // Retrieve BridgeUid if we haven't done this before
      if (!employee.bridgeUid) {
        const bridgeService = new BridgeService(this.$axios);
        employee.bridgeUid = await bridgeService.getMe();

        await employeesService.updateEmployee({
          ...employee!,
          picture: employee.picture || generateAvatarURL(employee.name),
          bridgeUid: employee.bridgeUid,
          standBy: employee.standBy || false,
          billable: employee.billable,
        });
      }

      commit('setEmployee', {employee, isAdmin});
      commit('setError', null);

      return employee;
    } catch (error: any) {
      commit('setError', error);
      return null;
    }
  },
};

export default actions;
