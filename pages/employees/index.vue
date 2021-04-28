<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <b-container fluid class="app-table">
        <b-row class="app-table__top-row py-3">
          <b-col>
            <span class="font-weight-bold">Employees</span>
          </b-col>
        </b-row>

        <b-row
          v-for="employee in employees"
          :key="employee.id"
          class="app-table__row employee-row p-3 mr-0"
        >
          <b-avatar :src="employee.picture" />

          <div class="font-weight-bold employee-row__name my-2 mx-3">
            {{ employee.name }}
          </div>

          <b-button
            variant="info"
            class="ml-auto"
            @click="openEmployeePage(employee)"
          >
            Manage employee
          </b-button>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useRouter,
  useStore,
} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],

  head: {
    title: "Employees",
  },

  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();
    const employees = computed(() => store.state.employees.employees);
    store.dispatch("employees/getEmployees");

    const openEmployeePage = (employee: Employee) => {
      router.push(`employees/${employee.id}`);
    };

    return {
      employees,
      openEmployeePage,
    };
  },
});
</script>
