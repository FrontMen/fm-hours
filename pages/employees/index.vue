<template>
  <div class="page-wrapper pb-5">
    <div class="content-wrapper mt-5">
      <b-container class="mb-3" fluid>
        <b-row :no-gutters="true" class="px-3">
          <b-col>
            <div class="d-flex justify-content-end">
              <b-button v-b-modal.modal-center> + New employee </b-button>
            </div>
          </b-col>
        </b-row>
      </b-container>

      <b-container class="mb-3">
        <b-row>
          <b-col cols="4" class="pl-0">
            <label class="employee-status__label" for="employee-search">
              Search by employee name:
            </label>
            <b-input
              id="employee-search"
              v-model="searchInput"
              type="search"
              placeholder='Ex.: "John"'
            />
          </b-col>
          <b-col cols="3">
            <label class="employee-status__label" for="status-select">
              Filter by status:
            </label>
            <b-form-select
              id="status-select"
              v-model="statusSelected"
              :options="statusOptions"
            />
          </b-col>
        </b-row>
      </b-container>
      <b-container fluid class="app-table">
        <b-row class="app-table__top-row py-3">
          <b-col>
            <span class="font-weight-bold">Employees</span>
          </b-col>
        </b-row>

        <b-row
          v-if="!filteredEmployees.length"
          class="app-table__row employee-row p-3 mr-0 align-items-center justify-content-center"
        >
          <b-icon-person-x class="mr-2" />
          No employee found.
        </b-row>

        <b-row
          v-for="employee in filteredEmployees"
          v-else
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
    <b-modal
      id="modal-center"
      centered
      title="Add a employee"
      cancel-variant="danger"
      :ok-disabled="!canAddEmployee"
      @ok="addEmployee()"
    >
      <b-form-input v-model="newEmployee.name" placeholder="Employee name" />
      <b-form-input
        v-model="newEmployee.email"
        type="email"
        placeholder="Employee email"
        class="mt-3"
      />
      <label for="employee-start-date" class="mt-3">Start date:</label>
      <b-form-datepicker
        id="employee-start-date"
        v-model="newEmployee.startDate"
        class="w-75"
      />
      <b-form-checkbox v-model="newEmployee.travelAllowance" class="mt-3">
        Travel allowance
      </b-form-checkbox>
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  ref,
  computed,
  defineComponent,
  useRouter,
  useStore,
} from "@nuxtjs/composition-api";

import { validateEmail } from "../../helpers/validation";
import { formatDate } from "~/helpers/dates";
import { checkEmployeeAvailability } from "~/helpers/employee";

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

    const statusSelected = ref<string>("all");
    const statusOptions = [
      { value: "all", text: "All" },
      { value: "active", text: "Active" },
      { value: "incative", text: "Inactive" },
    ];

    const searchInput = ref<string>("");

    const getEmployeeFilterStatus = (status: string, employee: Employee) => {
      if (status === "all") return true;

      const isSelectStatusActive = statusSelected.value === "active";
      const isActive = checkEmployeeAvailability(employee, new Date());
      return isActive === isSelectStatusActive;
    };

    const filteredEmployees = computed(() => {
      // Avoid traverse array when no filter is set
      if (statusSelected.value === "all" && !searchInput.value)
        return [...employees.value];

      return employees.value.filter(
        (employee) =>
          getEmployeeFilterStatus(statusSelected.value, employee) &&
          employee.name.toUpperCase().includes(searchInput.value.toUpperCase())
      );
    });

    const openEmployeePage = (employee: Employee) => {
      router.push(`/employees/${employee.id}`);
    };

    const newEmployee = ref({
      name: "",
      email: "",
      startDate: formatDate(new Date()),
      travelAllowance: false,
    });

    const canAddEmployee = computed(() => {
      const { name, email } = newEmployee.value;
      return name && validateEmail(email);
    });

    const addEmployee = () => {
      store.dispatch("employees/addNewEmployee", {
        ...newEmployee.value,
        startDate: new Date(newEmployee.value.startDate).getTime(),
      });

      newEmployee.value.name = "";
      newEmployee.value.email = "";
      newEmployee.value.startDate = formatDate(new Date());
      newEmployee.value.travelAllowance = false;
    };

    return {
      employees,
      newEmployee,
      canAddEmployee,
      addEmployee,
      openEmployeePage,
      statusSelected,
      statusOptions,
      filteredEmployees,
      searchInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.employee-status__label {
  min-width: fit-content;
  margin-bottom: 0;
  margin-right: 1rem;
}
</style>
