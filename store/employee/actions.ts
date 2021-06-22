import { ActionTree } from "vuex";
import EmployeesService from "~/services/employees-service";
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
      const { email, user_id: userId } = payload.claims;
  
      const employeeId = isDevelopment ? email : userId;
      let employee = await employeesService.getEmployee(employeeId);
      const isAdmin = await employeesService.isAdmin(employeeId);
  
      if (!employee) {
        await sleep(3000);
        employee = await employeesService.getEmployee(employeeId);
      }

<<<<<<< HEAD
    const employeeId = isDevelopment ? email : user_id;
    let employee = await employeesService.getEmployee(employeeId);
    const isAdmin = await employeesService.isAdmin(email);
=======
      if (!employee) {
        throw new Error("Employee not found!");
      }
>>>>>>> 1da328a (feat: set bridge cookie)

      const ppid = this.app.$apiService.getPPidFromJWTToken(
        payload.authUser.b.b.g
      );
      await this.app.$apiService.setSessionCookieByPpid(ppid);

      if (!employee.bridgeUid) {
        this.app.$apiService.getUserInfo().then((bridgeUid: string) => {
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
