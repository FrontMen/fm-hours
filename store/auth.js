export const state = () => ({
    isLoggedin: undefined,
    user: undefined
});


export const actions = {
    async onAuthStateChangedAction (context, { authUser, claims }) {
        if (authUser) {
            const usersRef = this.$fire.firestore.collection('users');
            const user = await usersRef.doc(claims.user_id).get();
            if (user.exists) {
                context.dispatch('loginSuccess', user.data());
            } else {
                const newUser = await usersRef.doc(claims.user_id).set({
                    name: claims.name,
                    time_records: []
                });
                context.dispatch('loginSuccess', newUser.data());
            }
        } else {
            console.log('no user');
        }
    },
    loginSuccess (context, payload) {
        context.commit('loginSuccess', payload);
    }
}

export const mutations = {
    loginSuccess: (state, payload) => {
        state.isLoggedin = true;
        state.user = payload;
      },
}

export const getters = {
    getUser: state => {
        console.log('state', state.user);
      return state.user
    }
}