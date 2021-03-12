import { MutationTree } from "vuex";

const mutations: MutationTree<UsersStoreState> = {
  setUsers: (state, payload: { users: User[] }) => {
    state.users = payload.users;
  },

  updateUser: (state, payload: { user: User }) => {
    state.users = state.users.map((user) =>
      user.id === payload.user.id ? payload.user : user
    );
  },
};

export default mutations;
