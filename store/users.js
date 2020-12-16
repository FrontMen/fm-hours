import { isWithinInterval, isSameDay, formatISO, startOfISOWeek, addDays, subDays } from 'date-fns';
import { debounce } from '../helpers/debounce';

export const state = () => ({
    users: undefined,
});

export const actions = {
    async getUserList (context) {
        const ref = this.$fire.firestore.collection('users');
        const users = await ref.get();
        const usersEntities = users.docs.map((res) => ({id: res.id, ...res.data()}));
        context.commit('getUsersSuccess', usersEntities);
    },
    async toggleTravelAllowance (context, payload) {
        const travelAllowanceAllowed = !payload.travelAllowance;
        const newUser = {...payload, travelAllowance: travelAllowanceAllowed};
        this.$fire.firestore.collection('users').doc(payload.id).set({
            travelAllowance: travelAllowanceAllowed
        }, { merge: true });
        context.commit('updateUser', newUser);
    },
}

export const mutations = {
    getUsersSuccess: (state, payload) => {
        state.users = payload;
    },
    updateUser: (state, payload) => {
        console.log('payload', payload);
        state.users = state.users.map((user) => user.id === payload.id ? payload : user);
        console.log('state', state.users);
    },
}

export const getters = {
    getUsers: state => {
        return state.users;
    },
}