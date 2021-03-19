<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <div v-if="!user">User not found</div>
      <div v-else>
        {{ user.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  useStore,
  useRouter,
} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const users = computed(() => store.state.users.users);
    const customers = computed(() => store.state.customers.customers);

    const userId = router.currentRoute.params.user_id;
    const user = computed(() => users.value.find((x) => x.id === userId));

    onMounted(() => {
      if (users.value.length === 0) store.dispatch("users/getUsers");

      if (customers.value.length === 0)
        store.dispatch("customers/getCustomers");
    });

    return {
      user,
    };
  },
});
</script>
