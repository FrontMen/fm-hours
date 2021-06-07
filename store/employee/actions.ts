/* eslint-disable camelcase */
import { ActionTree } from "vuex";
import EmployeesService from "~/services/employees-service";

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async login() {
    // const provider = new this.$fireModule.auth.GoogleAuthProvider();
    const provider = new this.$fireModule.auth.SAMLAuthProvider("saml.intracto");
    await this.$fire.auth.signInWithPopup(provider);
  },

  logout({ commit }) {
    this.$fire.auth.signOut();
    this.app.router?.push("/");

    commit("resetEmployee");
  },

  async onAuthStateChanged(
    { commit },
    payload: { authUser?: any; claims?: any }
  ) {
    if (!payload.authUser) return;
    const employeesService = new EmployeesService(this.$fire);
    const employee = await employeesService.getEmployee(payload.claims.user_id);
    const isAdmin = await employeesService.isAdmin(payload.claims.email);
    console.log("-->", payload)

    if (employee) {
      commit("setEmployee", { employee, isAdmin });
    } else {
      const newEmployee = {
        id: payload.claims.user_id,
        name: payload.claims.name,
        picture: payload.claims.picture,
        email: payload.claims.email,
        projects: [],
        travelAllowance: false,
        endDate: null,
      };
      commit("setEmployee", { employee: newEmployee, isAdmin });
    }
  },
};

export default actions;
