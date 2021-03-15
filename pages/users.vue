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
          v-for="user in users"
          :key="user.id"
          class="app-table__row user-row py-3"
        >
          <b-col cols-md="7">
            <div class="font-weight-bold user-row__name">
              {{ user.name }}
            </div>
          </b-col>
          <b-col cols-md="4" class="d-flex justify-content-end">
            <b-button @click="toggleTravelAllowance(user)">
              {{ user.travelAllowance ? "Disable" : "Enable" }} travel allowance
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useStore } from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const store = useStore<RootStoreState>();
    const users = computed(() => store.state.users.users);
    store.dispatch("users/getUsers");

    const toggleTravelAllowance = (user: User) => {
      store.dispatch("users/toggleTravelAllowence", user);
    };

    return {
      users,
      toggleTravelAllowance,
    };
  },
});
</script>
