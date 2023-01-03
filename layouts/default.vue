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
} from '@nuxtjs/composition-api';

export default defineComponent({
  middleware: ['isAuthenticated', 'checkEmployee'],
  setup() {
    const store = useStore<RootStoreState>();

    const user = computed(() => store.state.auth.user);
    const employee = computed(() => store.state.employee.employee);

    const logout = () => {
      store.dispatch('auth/logout');
    };

    return {
      employee,
      user,
      logout,
    };
  },
});
</script>
