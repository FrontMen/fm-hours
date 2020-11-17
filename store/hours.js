export const state = () => ({
    users: undefined,
});

export const actions = {
    async getUsers (context) {
        const ref = this.$fire.firestore.collection('users');
        const users = await ref.get();
        const mappedUsers = users.docs.map((res) => res.data());
        context.commit('getUsersSuccess', mappedUsers)
    },
}

export const mutations = {
    getUsersSuccess(state, payload) {
        state.users = payload;
    },
}