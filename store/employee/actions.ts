import { ActionTree } from "vuex";
import EmployeesService from "~/services/employees-service";
import AuthService from "~/services/auth-service";
import { sleep } from "~/helpers/helpers";

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async login({ commit }) {
    try {
      commit("setLoading", true);
      commit("setErrorMessage", "");
      const provider = new this.$fireModule.auth.SAMLAuthProvider(
        "saml.intracto"
      );
      await this.$fire.auth.signInWithPopup(provider);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      commit("setLoading", false);
      commit(
        "setErrorMessage",
        "An unexpected error happened while trying to log in"
      );
    }
  },

  logout({ commit }) {
    const authService = new AuthService(this.$fire, this.$axios);

    localStorage.removeItem("@fm-hours/ppid");
    authService.deleteAuthCookie();

    this.$fire.auth.signOut();
    this.app.router?.push("/");

    commit("setLoading", false);
    commit("resetEmployee");
  },

  async onAuthStateChanged(
    { commit, dispatch },
    payload: { authUser?: any; claims?: any }
  ) {
    if (!payload.authUser) return;
    const { isDevelopment } = this.app.$config;

    try {
      const employeesService = new EmployeesService(this.$fire);
      const authService = new AuthService(this.$fire, this.$axios);

      if (!authService.getAuthCookie()) {
        const ppid =
          localStorage.getItem("@fm-hours/ppid") ||
          authService.getPPidFromJWTToken(payload.authUser.b.b.g);

        if (!ppid)
          throw new Error("User is not authenticated, please sign in again!");

        await authService.setSessionCookieByPpid(ppid);
      }

      const { email, user_id: userId } = payload.claims;

      const employeeId = isDevelopment ? email : userId;

      let employee = await employeesService.getEmployee(employeeId);
      const isAdmin = await employeesService.isAdmin(email);

      if (!employee) {
        await sleep(3000);
        employee = await employeesService.getEmployee(employeeId);
      }

      if (!employee) throw new Error("Employee not found!");

      if (!employee.bridgeUid) {
        authService.getUserInfo().then((bridgeUid: string) => {
          employeesService.updateEmployee({
            ...employee!,
            bridgeUid,
          });
        });
      }

      commit("setEmployee", { employee, isAdmin });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      commit(
        "setErrorMessage",
        "An unexpected error happened while trying to log in"
      );
      dispatch("logout");
    }
  },
};

export default actions;
