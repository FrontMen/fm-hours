import type {ActionTree} from 'vuex';

const EMPLOYEE_NOT_FOUND = 'employee_not_found';

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async get({commit, rootState}) {
    if (!rootState.auth.user) return;

    try {
      const {user} = rootState.auth;

      const employee = await this.app.$employeesService.getByMail(user.email);

      if (!employee) throw new Error(EMPLOYEE_NOT_FOUND);

      if (!employee?.bridgeUid) {
        const bridgeUid = await this.app.$bridgeService.getMe();

        await  this.app.$employeesService.update({
          ...employee,
          bridgeUid,
          standBy: employee.standBy || false
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
