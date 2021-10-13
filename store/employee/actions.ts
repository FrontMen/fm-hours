import type {ActionTree} from 'vuex';

import EmployeesService from '~/services/employees-service';
import {generateAvatarURL} from '~/helpers/employee';

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async getEmployee({commit, rootState}) {
    if (!rootState.auth.user) return;

    try {
      const employeesService = new EmployeesService(this.$fire);
      const {user} = rootState.auth;

      const employee = await employeesService.getEmployee(user.email);
      const isAdmin = await employeesService.isAdmin(user.email);

      if (!employee) throw new Error('Employee not found!');

      // Retrieve BridgeUid if we haven't done this before
      if (!employee.bridgeUid) {
        const {
          data: {bridgeUid},
        } = await this.$axios.get<{bridgeUid: string}>('/api/user/me', {
          headers: {Authorization: user.samlToken},
        });

        await employeesService.updateEmployee({
          ...employee!,
          picture: employee.picture || generateAvatarURL(employee.name),
          bridgeUid: employee.bridgeUid || bridgeUid,
        });
      }

      commit('setEmployee', {employee, isAdmin});

      return employee;
    } catch (error: any) {
      throw new Error(error);
    }
  },
};

export default actions;
