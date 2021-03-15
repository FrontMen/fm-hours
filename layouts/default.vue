<template>
  <div class="layout-wrapper">
    <top-bar :user="user" :is-admin="isAdmin" @logout="logout()" />
    <admin-sidebar v-if="isAdmin" />

    <Nuxt />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useStore } from "@nuxtjs/composition-api";

import AdminSidebar from "~/components/app/admin-sidebar.vue";
import TopBar from "~/components/app/top-bar.vue";

export default defineComponent({
  components: { AdminSidebar, TopBar },
  setup() {
    const store = useStore<RootStoreState>();
    store.dispatch("holidays/getHolidays");

    const user = computed(() => store.state.user.user);
    const isAdmin = computed(() => store.state.user.isAdmin);

    const logout = () => {
      store.dispatch("user/logout");
    };

    return {
      user,
      isAdmin,
      logout,
    };
  },
});
</script>
