import type {ActionTree} from 'vuex';

import EmployeesService from '~/services/employees-service';
import {generateAvatarURL} from '~/helpers/employee';

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async getEmployee({commit, rootState}) {
    if (!rootState.auth.user) return;

    try {
      const employeesService = new EmployeesService(this.$fire);
      const {user} = rootState.auth;

      const employee = await employeesService.getEmployeeByMail(user.email);
      const isAdmin = await employeesService.isAdmin(user.email);

      if (!employee) throw new Error('Employee not found!');

      // Retrieve BridgeUid if we haven't done this before
      if (!employee.bridgeUid) {
        employee.bridgeUid = await this.app.$bridgeService.getMe();

        await employeesService.updateEmployee({
          ...employee!,
          picture: employee.picture || generateAvatarURL(employee.name),
          bridgeUid: employee.bridgeUid,
          standBy: employee.standBy || false,
          billable: employee.billable,
        });
      }

      commit('setEmployee', {employee, isAdmin});

      return employee;
    } catch (error) {
      throw new Error(error);
    }
  },
};

export default actions;
