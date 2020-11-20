export const state = () => ({
    isLoggedin: undefined,
    user: undefined,
});


export const actions = {
    async onAuthStateChangedAction (context, { authUser, claims }) {
        if (authUser) {
            const usersRef = this.$fire.firestore.collection('users');
            const user = await usersRef.doc(claims.user_id).get();
            if (user.exists) {
                context.dispatch('loginSuccess', {id: user.id, ...user.data()});
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
    },
    async addHoursRecords (context, payload) {
        // const userId = context.getters.getUser.id;
        // console.log('write action for saving timerecords', payload);
        // const res = await this.$fire.firestore.collection('users').doc(userId).update({
        //     time_records: this.$fireModule.firestore.FieldValue.arrayUnion(payload)
        // });
        console.log('res', payload);
    },
}

export const mutations = {
    loginSuccess: (state, payload) => {
        state.isLoggedin = true;
        state.user = payload;
        console.log('user', state);
      },
}

export const getters = {
    getUser: state => {
      return state.user
    }
}