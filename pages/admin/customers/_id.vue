<template>
  <customer-form mode="edit" :customer="customer" />
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, useRouter, useStore} from '@nuxtjs/composition-api';

export default defineComponent({
  middleware: ['isAdmin'],
  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const customerId = router.currentRoute.params.id;
    const customers = computed(() => store.state.customers.customers);
    const customer: {value: Customer | undefined} = computed(() =>
      customers.value.find(x => x.id === customerId)
    );

    onMounted(() => {
      if (customers.value.length === 0) {
        store.dispatch('customers/getCustomers');
      }
    });

    return {
      customer,
    };
  },
});
</script>
