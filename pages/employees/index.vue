<i18n lang="yaml">
  en:
    searchEmployeeByName: "Search by employee name"
    namePlaceholder: "Ex.: \"John\""
    showInactive: "Show inactive"
    newEmployee: "New employee"
    noEmployeeFound: "No employee found"
    inactive: "Inactive"
    manageEmployee: "Manage employee"
    addEmployee: "Add an employee"
  nl:
    searchEmployeeByName: "#required"
    namePlaceholder: "#required"
    showInactive: "#required"
    newEmployee: "#required"
    noEmployeeFound: "#required"
    inactive: "#required"
    manageEmployee: "#required"
    addEmployee: "#required"
</i18n>

<template>
  <div class="content-wrapper mt-5">
    <b-container class="mx-0 px-0 mb-3" fluid>
      <b-row :no-gutters="true">
        <b-col cols="12" sm="6" lg="2" class="pl-0 mb-3 pr-2">
          <label class="employee-status__label" for="status-select">
            {{$t('filterBy')}}:
          </label>
          <b-form-select
            id="status-select"
            v-model="filterBy"
            :options="filterByOptions"
          />
        </b-col>
        <b-col cols="12" sm="6" lg="3" class="pl-0 mb-3 pr-2">
          <label class="employee-status__label" for="employee-search">
            {{$t('searchEmployeeByName')}}:
          </label>
          <b-input
            id="employee-search"
            v-model="searchInput"
            type="search"
            :placeholder="$t('namePlaceholder')"
          />
        </b-col>
        <b-col cols="12" sm="6" lg="3" class="mb-3 pr-2">
          <label class="employee-status__label" for="customer-select">
            {{$t('filterByCustomer')}}:
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
            :placeholder="$t('customerName')"
          >
            <template slot="selection" slot-scope="{values}">
              <span v-if="values.length">
                {{ $t('noOptions', {num: values.length}) }}
              </span>
            </template>
          </multiselect>
        </b-col>
        <b-col cols="6" lg="2" class="mt-auto pb-2 mb-3 pr-2">
          <b-form-checkbox v-model="showInactive" switch class="mr-3 ml-auto">
            {{$t('showInactive')}}
          </b-form-checkbox>
        </b-col>
        <b-col
          cols="6"
          lg="2"
          class="d-flex align-items-end justify-content-end mb-3"
        >
          <b-button v-b-modal.modal-center>+ {{$t('newEmployee')}}</b-button>
        </b-col>
      </b-row>
    </b-container>
    <b-container fluid class="app-table">
      <b-row class="app-table__top-row py-3">
        <b-col>
          <span class="font-weight-bold">{{$t('employees')}}</span>
        </b-col>
      </b-row>

      <b-row
        v-if="!filteredEmployees.length"
        class="app-table__row employee-row p-3 mr-0 align-items-center justify-content-center"
      >
        <b-icon-person-x class="mr-2" />
        {{$t('noEmployeeFound')}}.
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
          <small v-if="employee.team">- {{ employee.team }}</small>
          <b-badge
            v-if="!checkEmployeeAvailability(employee, new Date())"
            variant="danger"
          >
            {{$t('inactive')}}
          </b-badge>
        </div>

        <div class="ml-auto d-flex">
          <nuxt-link
            class="btn btn-info"
            :to="localePath(`/employees/${employee.id}`)"
          >
            {{$t('manageEmployee')}}
          </nuxt-link>
        </div>
      </b-row>
    </b-container>
    <b-modal
      id="modal-center"
      centered
      :title="$t('addEmployee')"
      cancel-variant="danger"
      :ok-disabled="!canAddEmployee"
      :ok-title="$t('ok')"
      :cancel-title="$t('cancel')"
      @ok="addEmployee()"
    >
      <b-form-input
        v-model="newEmployee.name"
        :placeholder="$t('employeeName')"
      />
      <b-form-input
        v-model="newEmployee.email"
        type="email"
        :placeholder="$t('employeeEmail')"
        class="mt-3"
      />
      <label for="employee-start-date" class="mt-3">Start date:</label>
      <b-form-datepicker
        id="employee-start-date"
        v-model="newEmployee.startDate"
        :locale="isoLocale"
        class="w-75"
      />
      <b-form-checkbox v-model="newEmployee.travelAllowance" class="mt-3">
        {{$t('travelAllowance')}}
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
  useContext,
} from "@nuxtjs/composition-api";
import Multiselect from "vue-multiselect";

import {validateEmail} from "../../helpers/validation";
import {formatDate} from "~/helpers/dates";
import {checkEmployeeAvailability} from "~/helpers/employee";
import {queryOnString} from "~/helpers/helpers";

export default defineComponent({
  components: {Multiselect},

  middleware: ["isAdmin"],

  head: {
    title: "Employees",
  },

  setup() {
    const { i18n } = useContext();
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
    });

    const isoLocale = computed(() => {
      return i18n.localeProperties.iso;
    });

    const customerOptions = computed(() =>
      customers.value
        .filter((customer) => !customer.isDefault)
        .map((customer) => ({
          ...customer,
          label: `${customer.name} (${customer.debtor})`,
        }))
    );

    const selectedCustomers = ref<Customer[]>(
      store.getters["filters/getEmployeeFilterByCustomer"]
    );

    const filterByOptions: { value: keyof Employee; text: string; }[] = [
      {
        value: 'name',
        text: i18n.t('name') as string,
      },
      {
        value: 'team',
        text: i18n.t('team') as string,
      }
    ];
    const filterBy = ref<keyof Employee>(
      store.getters["filters/getEmployeeFilterBy"]
    );

    const showInactive = ref<boolean>(
      store.getters["filters/getEmployeeShowInactive"]
    );

    const searchInput = ref<string>(
      store.getters["filters/getEmployeeSearchTerm"]
    );

    const handleFilterUpdates = () => {
      if (
        store.getters["filters/getEmployeeSearchTerm"] !== searchInput.value
      ) {
        store.dispatch("filters/updateEmployeeSearchTerm", searchInput.value);
      }
      if (
        store.getters["filters/getEmployeeFilterBy"] !== filterBy.value
      ) {
        store.dispatch("filters/updateEmployeeFilterBy", filterBy.value);
      }
      if (
        store.getters["filters/getEmployeeFilterByCustomer"] !==
        selectedCustomers.value
      ) {
        store.dispatch(
          "filters/updateEmployeeFilterByCustomer",
          selectedCustomers.value
        );
      }
      if (
        store.getters["filters/getEmployeeShowInactive"] !== showInactive.value
      ) {
        store.dispatch("filters/updateEmployeeShowInactive", showInactive.value);
      }
    };

    const employeeStatusChecker = (status: boolean, employee: Employee) => {
      if (status) return true;

      const isActive = checkEmployeeAvailability(employee, new Date());
      return isActive;
    };

    const employeeByProp = (employee: Employee, query: string, filterByProp: keyof Employee) => {
      if (!query || !employee) return true;
      if (!employee[filterByProp]) return;

      return queryOnString(employee[filterByProp] as string, query);
    };

    const employeeProjectsChecker = (
      employeeProjectsIds: string[],
      selectedProjects: Customer[]
    ) => {
      if (!selectedProjects?.length) return true;
      if (!employeeProjectsIds?.length) return false;

      return employeeProjectsIds.every((id) =>
        selectedProjects.some((project) => project.id === id)
      );
    };

    const filteredEmployees = computed(() => {
      handleFilterUpdates();
      // Avoid traverse array when no filter is set
      if (
        showInactive.value &&
        !searchInput.value &&
        !selectedCustomers.value?.length
      )
        return [...employees.value];

      return employees.value.filter((employee) => {
        return (
          employeeStatusChecker(showInactive.value, employee) &&
          employeeByProp(employee, searchInput.value, filterBy.value) &&
          employeeProjectsChecker(employee.projects, selectedCustomers.value)
        );
      });
    });

    const newEmployee = ref({
      name: "",
      email: "",
      startDate: formatDate(new Date()),
      travelAllowance: false,
    });

    const canAddEmployee = computed(() => {
      const {name, email} = newEmployee.value;
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
      employees,
      newEmployee,
      canAddEmployee,
      addEmployee,
      filteredEmployees,
      filterBy,
      filterByOptions,
      isoLocale,
      searchInput,
      customerOptions,
      selectedCustomers,
      showInactive,
      checkEmployeeAvailability,
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
.customer-select__wrapper {
  .multiselect__tags {
    min-height: 38px;
    padding-top: 6px;
    border-color: #ced4da;
  }
  .multiselect__placeholder {
    padding-top: 0px;
  }
}
</style>
