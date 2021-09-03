import {ActionTree} from 'vuex';

import EmployeesService from '~/services/employees-service';
// import AuthService from '~/services/auth-service';
// import {generateAvatarURL} from '~/helpers/employee';

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async getEmployee({commit, rootState}) {
    if (!rootState.auth.user) return;

    try {
      const employeesService = new EmployeesService(this.$fire);
      // // const authService = new AuthService(this.$fire, this.$axios);
      // //     if (!authService.getAuthCookie()) {
      // //       const ppid =
      // //         localStorage.getItem('@fm-hours/ppid') ||
      // //         authService.getPPidFromJWTToken(payload.authUser.b.b.g);
      // //       if (!ppid)
      // //         throw new Error('User is not authenticated, please sign in again!');
      // //       await authService.setSessionCookieByPpid(ppid);
      // //     }

      const {user} = rootState.auth;

      const employee = await employeesService.getEmployee(user.email);
      const isAdmin = await employeesService.isAdmin(user.email);

      if (!employee) throw new Error('Employee not found!');
      // if (!employee.bridgeUid || !employee.picture) {
        // throw new Error('Employee found but incomplete');
        // authService.getUserInfo().then((bridgeUid: string) => {
        //   employeesService.updateEmployee({
        //     ...employee!,
        //     picture: employee.picture || generateAvatarURL(employee.name),
        //     bridgeUid: employee.bridgeUid || bridgeUid,
        //   });
        // });
      // }
      commit('setEmployee', {employee, isAdmin});

      return employee;
    } catch (error) {
      // dispatch(
      //   'auth/setErrorMessage',
      //   error.response
      //     ? 'An unexpected error happened while trying to get the employee details'
      //     : error.message
      // );
      throw new Error(error);
    }
  },
};

export default actions;
