export const state = () => ({
    isLoggedin: undefined,
    user: undefined
});


export const actions = {
    async onAuthStateChangedAction (context, { authUser, claims }) {

        if (authUser) {
            console.log('user exist');
            const usersRef = this.$fire.firestore.collection('users');
            const user = await usersRef.doc(claims.user_id).get();
            if (user.exists) {
                context.dispatch('loginSuccess', user.data());
            } else {
                usersRef.doc(claims.user_id).set({
                    name: claims.name,
                    time_records: []
                }).then((user) => {
                    context.dispatch('loginSuccess', user.data());
                });
            }
        } else {
            console.log('no user');
        }
    },
    loginSuccess (context, payload) {
        context.commit('loginSuccess', payload);
        this.$router.push('/hours');
    }
}

export const mutations = {
    loginSuccess: (state, payload) => {
        state.isLoggedin = true;
        state = {
            ...state,
            isLoggedin: true,
            user: payload,
        }
      },
}