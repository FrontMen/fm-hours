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
          class="app-table__row employee-row py-3"
        >
          <b-col cols="0" class="ml-3">
            <b-avatar :src="employee.picture" />
          </b-col>

          <b-col cols="4">
            <div class="font-weight-bold employee-row__name my-2">
              {{ employee.name }}
            </div>
          </b-col>

          <b-col cols="7" class="d-flex justify-content-end">
            <template v-if="employee.active">
              <b-button variant="info" @click="openEmployeePage(employee)">
                Manage projects
              </b-button>

              <b-button class="mx-2" @click="toggleTravelAllowance(employee)">
                {{ employee.travelAllowance ? "Disable" : "Enable" }} travel
                allowance
              </b-button>
            </template>

            <b-button
              :variant="employee.active ? 'warning' : 'danger'"
              @click="toggleActive(employee)"
            >
              {{ employee.active ? "Deactivate" : "Activate" }} employee
            </b-button>
          </b-col>
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

    const toggleActive = (employee: Employee) => {
      store.dispatch("employees/toggleActive", employee);
    };

    const toggleTravelAllowance = (employee: Employee) => {
      store.dispatch("employees/toggleTravelAllowance", employee);
    };

    const openEmployeePage = (employee: Employee) => {
      router.push(`employees/${employee.id}`);
    };

    return {
      employees,
      toggleActive,
      toggleTravelAllowance,
      openEmployeePage,
    };
  },
});
</script>
