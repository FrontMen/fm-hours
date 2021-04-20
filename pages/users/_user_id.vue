<template>
  <div class="page-wrapper">
    <div class="content-wrapper my-5">
      <div v-if="!user">User not found</div>

      <div v-else>
        <user-header :user="user" />

        <b-form-checkbox-group
          v-model="selectedCustomers"
          :options="customerOptions"
          class="my-3"
          value-field="item"
          text-field="name"
          switches
          stacked
          @change="hasUnsavedChanges = true"
        />

        <b-button :disabled="!hasUnsavedChanges" @click="saveProjects">
          Save
        </b-button>
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
  useMeta,
  watch,
  ref,
} from "@nuxtjs/composition-api";

import UserHeader from "~/components/app/user-header.vue";

export default defineComponent({
  components: { UserHeader },
  middleware: ["isAdmin"],
  head: {},
  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const selectedCustomers = ref<string[]>([]);
    const hasUnsavedChanges = ref<boolean>(false);

    const customers = computed(() => store.state.customers.customers);
    const customerOptions = computed(() =>
      customers.value.map((customer) => ({
        item: customer.id,
        name: `${customer.name} (${customer.debtor})`,
      }))
    );

    const userId = router.currentRoute.params.user_id;
    const users = computed(() => store.state.users.users);
    const user = computed(() => users.value.find((x) => x.id === userId));

    useMeta({ title: `Users - ${user.value?.name}` });

    onMounted(() => {
      if (users.value.length === 0) {
        store.dispatch("users/getUsers");
      }

      if (customers.value.length === 0) {
        store.dispatch("customers/getCustomers");
      }
    });

    watch(
      () => user.value?.projects,
      () => {
        selectedCustomers.value = user.value?.projects || [];
      },
      { immediate: true }
    );

    const saveProjects = () => {
      store.dispatch("users/saveProjects", {
        user: user.value,
        customerIds: selectedCustomers.value,
      });

      hasUnsavedChanges.value = false;
    };

    return {
      user,
      customerOptions,
      selectedCustomers,
      saveProjects,
      hasUnsavedChanges,
    };
  },
});
</script>
