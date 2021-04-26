<template>
  <div class="page-wrapper">
    <div class="content-wrapper my-5">
      <div v-if="!employee">Employee not found</div>

      <div v-else>
        <employee-header :employee="employee" />

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

import EmployeeHeader from "~/components/app/employee-header.vue";

export default defineComponent({
  components: { EmployeeHeader },
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

    const employeeId = router.currentRoute.params.employee_id;
    const employees = computed(() => store.state.employees.employees);
    const employee = computed(() =>
      employees.value.find((x) => x.id === employeeId)
    );

    useMeta({ title: `Employees - ${employee.value?.name}` });

    onMounted(() => {
      if (employees.value.length === 0) {
        store.dispatch("employees/getEmployees");
      }

      if (customers.value.length === 0) {
        store.dispatch("customers/getCustomers");
      }
    });

    watch(
      () => employee.value?.projects,
      () => {
        selectedCustomers.value = employee.value?.projects || [];
      },
      { immediate: true }
    );

    const saveProjects = () => {
      store.dispatch("employees/saveProjects", {
        employee: employee.value,
        customerIds: selectedCustomers.value,
      });

      hasUnsavedChanges.value = false;
    };

    return {
      employee,
      customerOptions,
      selectedCustomers,
      saveProjects,
      hasUnsavedChanges,
    };
  },
});
</script>
