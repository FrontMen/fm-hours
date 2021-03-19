<template>
  <div class="page-wrapper">
    <div class="content-wrapper my-5">
      <div v-if="!user">User not found</div>

      <div v-else>
        <user-header :user="user" />
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

import UserHeader from "~/components/app/user-header.vue";

export default defineComponent({
  components: { UserHeader },
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
