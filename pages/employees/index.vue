<template>
  <div class="page-wrapper">
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
      router.push(`/employees/${employee.id}`);
    };

    const newEmployee = ref({
      name: "",
      email: "",
      travelAllowance: false,
    });

    const canAddEmployee = computed(() => {
      const { name, email } = newEmployee.value;
      return name && validateEmail(email);
    });

    const addEmployee = () => {
      store.dispatch("employees/addNewEmployee", {
        ...newEmployee.value,
      });

      newEmployee.value.name = "";
      newEmployee.value.email = "";
      newEmployee.value.travelAllowance = false;
    };

    return {
      employees,
      newEmployee,
      canAddEmployee,
      addEmployee,
      openEmployeePage,
    };
  },
});
</script>
