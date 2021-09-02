<template>
  <div class="layout-wrapper">
    <div>
      employeeeee: {{employee}} isAdmin: {{isAdmin}}
      <button @click="logout()">logout</button>
    </div>

    <!-- <top-bar
      :employee="employee"
      :is-admin="isAdmin"
      :is-dev="$config.isDevelopment"
      @logout="logout()"
    /> -->
    <!-- <admin-sidebar v-if="isAdmin" /> -->
    <Nuxt />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useStore,
  ref,
  useRouter,
  useContext
} from '@nuxtjs/composition-api';

import AdminSidebar from '~/components/app/admin-sidebar.vue';
import TopBar from '~/components/app/top-bar.vue';

export default defineComponent({
  components: {AdminSidebar, TopBar},
  middleware: ['isNotAuthenticated'],
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();
    const {localePath} = useContext();

    const isAuthed = ref<boolean>(
      store.getters['auth/isUserLoggedIn']
    );

    const user = computed(() => store.state.auth.user);


    const isAdmin = computed(() => store.state.employee.isAdmin);
    const employee = computed(() => store.state.employee.employee);

    const logout = async () => {
      const authState = await store.dispatch('auth/logout');
      if (authState) router.push(localePath('/login'));
    };

    if (isAuthed) store.dispatch('employee/getEmployee');

    return {
      employee,
      isAdmin,
      user,
      logout
    };
  },
});
</script>
