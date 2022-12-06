<template>
  <div class="d-flex">
    <admin-sidebar v-if="employee?.isAdmin" />
    <div class="layout-wrapper col p-0">
      <top-bar :employee="employee" :is-dev="$config.isDevelopment" @logout="logout()" />

      <Nuxt />
    </div>
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

export default defineComponent({
  middleware: ['isAuthenticated', 'checkEmployee'],
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();
    const {localePath} = useContext();

    const user = computed(() => store.state.auth.user);
    const employee = computed(() => store.state.employee.employee);

    const logout = async () => {
      const authState = await store.dispatch('auth/logout');
      if (authState) router.push(localePath('/login'));
    };

    return {
      employee,
      user,
      logout,
    };
  },
});
</script>
