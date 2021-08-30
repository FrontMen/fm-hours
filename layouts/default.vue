<template>
  <div class="layout-wrapper">
    <top-bar
      :employee="user"
      :is-admin="false"
      :is-dev="$config.isDevelopment"
      @logout="logout()"
    />
    <admin-sidebar v-if="true" />

    <Nuxt />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, useStore} from "@nuxtjs/composition-api";

import AdminSidebar from "~/components/app/admin-sidebar.vue";
import TopBar from "~/components/app/top-bar.vue";

export default defineComponent({
  components: {AdminSidebar, TopBar},
  middleware: ['isAuthenticated'],
  setup() {
    const store = useStore<RootStoreState>();

    const user = computed(() => store.state.auth.user);
    // const isAdmin = computed(() => store.state.auth.isAdmin);

    const logout = () => {
      store.dispatch("auth/logout");
    };

    return {
      user,
      logout,
    };
  },
});
</script>
