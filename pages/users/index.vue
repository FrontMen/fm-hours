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
          <b-col cols="0" class="ml-3">
            <b-avatar :src="user.picture" />
          </b-col>

          <b-col cols="4">
            <div class="font-weight-bold user-row__name my-2">
              {{ user.name }}
            </div>
          </b-col>

          <b-col cols="7" class="d-flex justify-content-end">
            <template v-if="user.active">
              <b-button variant="info" @click="openUserPage(user)">
                Manage projects
              </b-button>

              <b-button class="mx-2" @click="toggleTravelAllowance(user)">
                {{ user.travelAllowance ? "Disable" : "Enable" }} travel
                allowance
              </b-button>
            </template>

            <b-button
              :variant="user.active ? 'warning' : 'danger'"
              @click="toggleActive(user)"
            >
              {{ user.active ? "Deactivate" : "Activate" }} user
            </b-button>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useRouter,
  useStore,
} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();
    const users = computed(() => store.state.users.users);
    store.dispatch("users/getUsers");

    const toggleActive = (user: User) => {
      store.dispatch("users/toggleActive", user);
    };

    const toggleTravelAllowance = (user: User) => {
      store.dispatch("users/toggleTravelAllowance", user);
    };

    const openUserPage = (user: User) => {
      router.push(`users/${user.id}`);
    };

    return {
      users,
      toggleActive,
      toggleTravelAllowance,
      openUserPage,
    };
  },
});
</script>
