<template>
  <div class="page-wrapper pb-5">
    <div class="content-wrapper mt-5">
      <b-container class="mb-3" fluid>
        <b-row :no-gutters="true" class="px-3">
          <b-col>
            <div class="d-flex justify-content-end">
              <b-button v-b-modal.modal-center>
                + New employee
              </b-button>
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
              placeholder="Ex.: &quot;John&quot;"
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

          <b-col cols="4">
            <label class="employee-status__label" for="customer-select">
              Filter by customer:
            </label>
            <multiselect
              id="customer-select"
              v-model="selectedCustomers"
              track-by="id"
              label="label"
              class="customer-select__wrapper"
              :options="customerOptions"
              :close-on-select="false"
              :multiple="true"
              :taggable="false"
              placeholder="Click or search for a customer here"
            >
              <template slot="selection" slot-scope="{ values }">
                <span v-if="values.length">
                  {{ values.length }} options selected
                </span>
              </template>
            </multiselect>
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

          <div class="ml-auto d-flex">
            <b-form-checkbox v-if="adminCheck" v-model="adminCheck[employee.email]" switch class="mt-2 mr-3" @change="(checked) => adminChange(checked, employee.email)">
              Admin
            </b-form-checkbox>

            <nuxt-link
              class="btn btn-info"
              :to="`/employees/${employee.id}`"
            >
              Manage employee
            </nuxt-link>
          </div>
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
  useStore,
  onMounted,
} from "@nuxtjs/composition-api";
import Multiselect from "vue-multiselect";

import { validateEmail } from "../../helpers/validation";
import { formatDate } from "~/helpers/dates";
import { checkEmployeeAvailability } from "~/helpers/employee";
import { queryOnString } from "~/helpers/helpers";

export default defineComponent({
  components: { Multiselect },

  middleware: ["isAdmin"],

  head: {
    title: "Employees",
  },

  setup() {
    const store = useStore<RootStoreState>();
    const employees = computed(() => store.state.employees.employees);
    const customers = computed(() => store.state.customers.customers);

    onMounted(() => {
      if (employees.value.length === 0) {
        store.dispatch("employees/getEmployees");
      }

      if (customers.value.length === 0) {
        store.dispatch("customers/getCustomers");
      }

      if (store.getters["employees/adminList"].length === 0) {
        store.dispatch("employees/getAdminList");
      }
    });

    const customerOptions = computed(() =>
      customers.value
        .filter((customer) => !customer.isDefault)
        .map((customer) => ({
          ...customer,
          label: `${customer.name} (${customer.debtor})`,
        }))
    );

    const selectedCustomers = ref<Customer[]>([]);

    const statusSelected = ref<string>("all");
    const statusOptions = [
      { value: "all", text: "All" },
      { value: "active", text: "Active" },
      { value: "incative", text: "Inactive" },
    ];

    const searchInput = ref<string>("");

    const employeeStatusChecker = (status: string, employee: Employee) => {
      if (status === "all") return true;

      const isSelectStatusActive = statusSelected.value === "active";
      const isActive = checkEmployeeAvailability(employee, new Date());
      return isActive === isSelectStatusActive;
    };

    const employeeNameChecker = (employeeName: string, query: string) => {
      if (!query) return true;

      return queryOnString(employeeName, query);
    };

    const employeeProjectsChecker = (
      employeeProjectsIds: string[],
      selectedProjects: Customer[]
    ) => {
      if (!selectedProjects.length) return true;
      if (!employeeProjectsIds.length) return false;

      return employeeProjectsIds.every((id) =>
        selectedProjects.some((project) => project.id === id)
      );
    };

    const filteredEmployees = computed(() => {
      // Avoid traverse array when no filter is set
      if (
        statusSelected.value === "all" &&
        !searchInput.value &&
        !selectedCustomers.value.length
      )
        return [...employees.value];

      return employees.value.filter(
        (employee) =>
          employeeStatusChecker(statusSelected.value, employee) &&
          employeeNameChecker(employee.name, searchInput.value) &&
          employeeProjectsChecker(employee.projects, selectedCustomers.value)
      );
    });

    const adminCheck = computed((): {[key:string]: boolean} => {
      const check: {[key:string]: boolean} = {};

      store.getters["employees/adminList"].forEach((admin: string) => {
        check[admin] = true;
      });

      return check;
    });

    const adminChange = (checked: any, email: string) => {
      let adminList = [...store.getters["employees/adminList"]];

      if (checked) {
        adminList.push(email)
      } else {
        adminList = adminList.filter(admin => admin !== email);
      }

      store.dispatch("employees/updateAdminList", adminList);
    }

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
        email: newEmployee.value.email.toLowerCase(),
      });

      newEmployee.value.name = "";
      newEmployee.value.email = "";
      newEmployee.value.startDate = formatDate(new Date());
      newEmployee.value.travelAllowance = false;
    };

    return {
      adminCheck,
      adminChange,
      employees,
      newEmployee,
      canAddEmployee,
      addEmployee,
      statusSelected,
      statusOptions,
      filteredEmployees,
      searchInput,
      customerOptions,
      selectedCustomers,
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

<style lang="scss">
.customer-select__wrapper .multiselect__tags {
  min-height: 38px;
  padding-top: 6px;
  border-color: #ced4da;
}
</style>
