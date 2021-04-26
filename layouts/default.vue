<template>
  <div class="layout-wrapper">
    <top-bar :employee="employee" :is-admin="isAdmin" @logout="logout()" />
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

    const employee = computed(() => store.state.employee.employee);
    const isAdmin = computed(() => store.state.employee.isAdmin);

    const logout = () => {
      store.dispatch("employee/logout");
    };

    return {
      employee,
      isAdmin,
      logout,
    };
  },
});
</script>
