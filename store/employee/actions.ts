/* eslint-disable camelcase */
import { ActionTree } from "vuex";

import EmployeesService from "~/services/employees-service";
import { sleep } from "~/helpers/helpers";

const actions: ActionTree<EmployeeStoreState, RootStoreState> = {
  async login({ commit }) {
    try {
      commit("setLoading", true);
      commit("setErrorMessage", "");
      const provider = new this.$fireModule.auth.GoogleAuthProvider();
      await this.$fire.auth.signInWithPopup(provider);
    } catch (err) {
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
    const employeesService = new EmployeesService(this.$fire);
    let employee = await employeesService.getEmployee(payload.claims.user_id);
    const isAdmin = await employeesService.isAdmin(payload.claims.email);

    if (!employee) {
      await sleep(3000);
      employee = await employeesService.getEmployee(payload.claims.user_id);
    }

    if (employee) {
      commit("setEmployee", { employee, isAdmin });
    } else {
      commit(
        "setErrorMessage",
        "An unexpected error happened while trying to log in"
      );
      dispatch("employee/logout");
    }
  },
};

export default actions;
