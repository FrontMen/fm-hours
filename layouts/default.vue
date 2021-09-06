<template>
  <div class="layout-wrapper">
    <top-bar
      :employee="employee"
      :is-admin="isAdmin"
      :is-dev="$config.isDevelopment"
      @logout="logout()"
    />
    <admin-sidebar v-if="isAdmin" />
    <Nuxt />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useStore,
  useRouter,
  useContext
} from '@nuxtjs/composition-api';

import AdminSidebar from '~/components/app/admin-sidebar.vue';
import TopBar from '~/components/app/top-bar.vue';

export default defineComponent({
  components: {AdminSidebar, TopBar},
  middleware: ['isAuthenticated'],
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();
    const {localePath} = useContext();

    const user = computed(() => store.state.auth.user);
    const employee = computed(() => store.state.employee.employee);
    const isAdmin = computed(() => store.state.employee.isAdmin);

    const logout = async () => {
      const authState = await store.dispatch('auth/logout');
      if (authState) router.push(localePath('/login'));
    };

    return {
      employee,
      isAdmin,
      user,
      logout,
    };
  },
});
</script>
