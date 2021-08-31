<template>
  <div class="layout-wrapper">
    <!-- <top-bar
      :employee="employee"
      :is-admin="false"
      :is-dev="$config.isDevelopment"
      @logout="logout()"
    /> -->
    <admin-sidebar v-if="true" />

    {{isAuthed}}

    <button @click="logout()">logout</button>

    <Nuxt />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useStore,
  ref
} from "@nuxtjs/composition-api";

import AdminSidebar from "~/components/app/admin-sidebar.vue";
import TopBar from "~/components/app/top-bar.vue";

export default defineComponent({
  components: {AdminSidebar, TopBar},
  middleware: ['isAuthenticated'],
  setup() {
    const store = useStore<RootStoreState>();

    const isAuthed = ref<boolean>(
      store.getters["auth/isUserLoggedIn"]
    );

    const user = computed(() => store.state.auth.user);

    // const isAdmin = computed(() => store.state.auth.isAdmin);

    const logout = async () => {
      console.log('logout')
      const authState = await store.dispatch('auth/logout');
      console.log('auth state', authState);
      // router.push('/login');
    };

    return {
      user,
      logout,
      isAuthed
    };
  },
});
</script>
