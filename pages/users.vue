<template>
  <div class="page-wrapper">
      <div class="content-wrapper mt-5">
        <b-container fluid class="app-table">
            <b-row class="app-table__top-row py-3">
                <b-col>
                    <span class="font-weight-bold">Users</span>
                </b-col>
            </b-row>
            <b-row
                class="app-table__row user-row py-3"
                v-for="user in users"
                :key="user.id"
            >
                <b-col cols-md="7">
                    <div class="font-weight-bold user-row__name">
                        {{user.name}}
                    </div>
                </b-col>
                <b-col cols-md="4" class="d-flex justify-content-end">
                    <b-button @click="toggleTravelAllowance(user)">
                        {{user.travelAllowance ? 'Disable' : 'Enable' }} travel allowance
                    </b-button>
                </b-col>
            </b-row>
        </b-container>
      </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from "vuex";
import { format, formatISO } from "date-fns";

export default Vue.extend({
    middleware: 'isAdmin',
    computed: {
        ...mapGetters({
            users: 'users/getUsers',
        }),
    },
    created() {
      this.$store.dispatch('users/getUserList');
    },
    methods: {
        toggleTravelAllowance: function(user) {
            this.$store.dispatch('users/toggleTravelAllowance', user);
        }
    }
})
</script>

<style lang="scss">

</style>