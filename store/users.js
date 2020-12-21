export const state = () => ({
  users: undefined,
});

export const actions = {
  async getUserList(context) {
    const ref = this.$fire.firestore.collection("users");
    const users = await ref.get();
    const usersEntities = users.docs.map((res) => ({
      id: res.id,
      ...res.data(),
    }));
    context.commit("getUsersSuccess", usersEntities);
  },
  async toggleTravelAllowance(context, payload) {
    const travelAllowanceAllowed = !payload.travelAllowance;
    const newUser = { ...payload, travelAllowance: travelAllowanceAllowed };
    await this.$fire.firestore.collection("users").doc(payload.id).set(
      {
        travelAllowance: travelAllowanceAllowed,
      },
      { merge: true }
    );
    context.commit("updateUser", newUser);
  },
};

export const mutations = {
  getUsersSuccess: (state, payload) => {
    state.users = payload;
  },
  updateUser: (state, payload) => {
    state.users = state.users.map((user) =>
      user.id === payload.id ? payload : user
    );
  },
};

export const getters = {
  getUsers: (state) => {
    return state.users;
  },
};
