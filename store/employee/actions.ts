import {ActionTree} from 'vuex';

import EmployeesService from '~/services/employees-service';
import AuthService from '~/services/auth-service';
import {generateAvatarURL} from '~/helpers/employee';

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async login({commit}) {
    try {
      commit('setLoading', true);
      commit('setErrorMessage', '');
      const provider = new this.$fireModule.auth.SAMLAuthProvider(
        'saml.intracto'
      );
      await this.$fire.auth.signInWithPopup(provider);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      commit('setLoading', false);
      commit(
        'setErrorMessage',
        'An unexpected error happened while trying to log in'
      );
    }
  },

  logout({commit}) {
    const authService = new AuthService(this.$fire, this.$axios);

    localStorage.removeItem('@fm-hours/ppid');
    authService.deleteAuthCookie();

    this.$fire.auth.signOut();
    this.app.router?.push('/');

    commit('setLoading', false);
    commit('resetEmployee');
  },

  async onAuthStateChanged(
    {commit, dispatch},
    payload: {authUser?: any; claims?: any}
  ) {
    if (!payload.authUser) return;

    try {
      const employeesService = new EmployeesService(this.$fire);
      const authService = new AuthService(this.$fire, this.$axios);

      if (!authService.getAuthCookie()) {
        const ppid =
          localStorage.getItem('@fm-hours/ppid') ||
          authService.getPPidFromJWTToken(payload.authUser.b.b.g);

        if (!ppid)
          throw new Error('User is not authenticated, please sign in again!');

        await authService.setSessionCookieByPpid(ppid);
      }

      const {email} = payload.claims;

      const employee = await employeesService.getEmployee(email);
      const isAdmin = await employeesService.isAdmin(email);

      if (!employee) throw new Error('Employee not found!');

      if (!employee.bridgeUid || !employee.picture) {
        authService.getUserInfo().then((bridgeUid: string) => {
          employeesService.updateEmployee({
            ...employee!,
            picture: employee.picture || generateAvatarURL(employee.name),
            bridgeUid: employee.bridgeUid || bridgeUid,
          });
        });
      }

      commit('setEmployee', {employee, isAdmin});
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      commit(
        'setErrorMessage',
        error.response
          ? 'An unexpected error happened while trying to log in'
          : error.message
      );
      dispatch('logout');
    }
  },
};

export default actions;
