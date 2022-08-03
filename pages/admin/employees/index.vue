<i18n lang="yaml">
en:
  searchEmployeeByName: "Search by employee name"
  searchEmployeeByTeam: "Search by employee team"
  namePlaceholder: "Ex.: \"John\""
  teamPlaceholder: "Ex.: \"Classics\""
  showInactive: "Show Inactive"
  expandSearchMenu: "More filters"
  showNotBillable: "Show not billable"
  notBillable: "Not billable"
  newEmployee: "Add employee"
  noEmployeeFound: "No employee found"
  inactive: "Inactive"
  manageEmployee: "Manage employee"
  addEmployee: "Add an employee"
nl:
  searchEmployeeByName: "Zoek medewerker op naam"
  searchEmployeeByTeam: "Zoek medewerker op team"
  namePlaceholder: "Bv.: \"John\""
  teamPlaceholder: "Bv.: \"Classics\""
  showInactive: "Toon Inactieve"
  expandSearchMenu: "Meer filters"
  showNotBillable: "Toon niet billable"
  notBillable: "Niet billable"
  newEmployee: "Nieuwe medewerker"
  noEmployeeFound: "Geen medewerker(s) gevonden"
  inactive: "Inactief"
  manageEmployee: "Medewerker bewerken"
  addEmployee: "Medewerker toevoegen"
</i18n>

<template>
  <div class="content-wrapper mt-5">
    <b-container class="mx-0 px-0" fluid :class="{'mb-3': !showMoreFilters}">
      <b-row no-gutters>
        <b-col cols="12" sm="6" lg="2" class="pl-0 mb-3 pr-2">
          <label class="employee-status__label" for="status-select">{{ $t('filterBy') }}:</label>
          <b-form-select id="status-select" v-model="filterBy" :options="filterByOptions" />
        </b-col>
        <b-col cols="12" sm="6" lg="3" class="pl-0 mb-3 pr-2">
          <label class="employee-status__label" for="employee-search">
            {{ filterBy === 'name' ? $t('searchEmployeeByName') : $t('searchEmployeeByTeam') }}:
          </label>
          <b-input
            id="employee-search"
            v-model="searchInput"
            type="search"
            :placeholder="filterBy === 'name' ? $t('namePlaceholder'): $t('teamPlaceholder')"
          />
        </b-col>
        <b-col cols="12" sm="6" lg="3" class="mb-3 pr-2">
          <label class="employee-status__label" for="customer-select">
            {{ $t('filterByCustomer') }}:
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
        <b-col cols="6" lg="2" class="align-self-center">
          <b-button variant="secondary" @click="showMoreFilters = !showMoreFilters">
            <span>
              {{ $t('expandSearchMenu') }}
              <b-icon-chevron-up v-if="showMoreFilters" />
              <b-icon-chevron-down v-else />
            </span>
          </b-button>
        </b-col>
        <b-col cols="6" lg="2" class="d-flex align-items-end justify-content-end mb-3">
          <nuxt-link class="btn btn-primary" :to="localePath(`/admin/employees/add`)">
            {{ $t('newEmployee') }}
            <b-icon icon="person" />
          </nuxt-link>
        </b-col>
      </b-row>
    </b-container>
    <b-container v-if="showMoreFilters" fluid class="mb-3">
      <b-row no-gutters>
        <b-form-checkbox v-model="showInactive" switch class="mr-3">
          {{ $t('showInactive') }}
        </b-form-checkbox>
        <b-form-checkbox v-model="showNotBillable" switch>
          {{ $t('showNotBillable') }}
        </b-form-checkbox>
      </b-row>
    </b-container>
    <b-container fluid class="app-table">
      <b-row class="app-table__top-row py-3">
        <b-col>
          <span class="font-weight-bold text-dark">{{ $t('employees') }}</span>
        </b-col>
      </b-row>

      <b-row
        v-if="!filteredEmployees.length"
        class="app-table__row employee-row p-3 mr-0 align-items-center justify-content-center"
      >
        <b-icon-person-x class="mr-2" />
        {{ $t('noEmployeeFound') }}.
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
          <b-badge v-if="!checkEmployeeAvailability(employee, new Date())" variant="danger">
            {{ $t('inactive') }}
          </b-badge>
          <b-badge v-if="!checkEmployeeBillable(false, employee)" variant="warning">
            {{ $t('notBillable') }}
          </b-badge>
        </div>

        <div class="ml-auto d-flex">
          <nuxt-link class="btn btn-info" :to="localePath(`/admin/employees/${employee.id}`)">
            {{ $t('manageEmployee') }}
          </nuxt-link>

          <b-dropdown :text="$t('insights')" variant="info" class="ml-3">
            <b-dropdown-item :to="localePath(`/insights/${employee.id}/${year}/`)">
              {{ $t("year") }}
            </b-dropdown-item>
            <b-dropdown-item :to="localePath(`/insights/${employee.id}/${year}/${month}`)">
              {{ $t("month") }}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, useContext, useStore,} from "@nuxtjs/composition-api";

import {checkEmployeeAvailability} from "~/helpers/employee";
import {queryOnString} from "~/helpers/helpers";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();
    const employees = computed(() => store.state.employees.employees);
    const customers = computed(() => store.state.customers.customers);
    const showMoreFilters = ref<boolean>(false);

    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    onMounted(() => {
      store.dispatch('employees/getEmployees');
      store.dispatch('customers/getCustomers');
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

    const filterByOptions: { value: keyof Employee; text: string; }[] = [
      {value: 'name', text: i18n.t('name') as string},
      {value: 'team', text: i18n.t('team') as string}
    ];
    const filterBy = ref<keyof Employee>('name');
    const showInactive = ref<boolean>(false);
    const showNotBillable = ref<boolean>(false);
    const searchInput = ref<string>('');

    const checkEmployeeActiveStatus = (status: boolean, employee: Employee) => {
      if (status) return true;

      return checkEmployeeAvailability(employee, new Date());
    };

    const checkEmployeeBillable = (showNotBillable: boolean, employee: Employee) => {
      return showNotBillable || employee.billable
    };

    const checkEmployeeProp = (employee: Employee, query: string, filterByProp: keyof Employee) => {
      if (!query || !employee) return true;
      if (!employee[filterByProp]) return;

      return queryOnString(employee[filterByProp] as string, query);
    };

    const checkEmployeeProjects = (
      employeeProjects: string[] | EmployeeProject[],
      selectedProjects: Customer[]
    ) => {
      if (!selectedProjects?.length) return true;
      if (!employeeProjects?.length) return false;

      function isNewStructure(project: string | EmployeeProject): project is EmployeeProject {
        return (project as EmployeeProject)?.customerId !== undefined;
      }

      return employeeProjects.some((employeeProject: string | EmployeeProject) => {
          return selectedProjects.some((project) => {
            if (isNewStructure(employeeProject)) {
              return project.id === employeeProject.customerId;
            }
            return project.id === employeeProject;
          });
        }
      );
    };

    const filteredEmployees = computed(() =>
      employees.value.filter((employee) =>
        (
          checkEmployeeActiveStatus(showInactive.value, employee) &&
          checkEmployeeBillable(showNotBillable.value, employee) &&
          checkEmployeeProp(employee, searchInput.value, filterBy.value) &&
          checkEmployeeProjects(employee.projects, selectedCustomers.value)
        )));


    return {
      employees,
      filteredEmployees,
      filterBy,
      filterByOptions,
      searchInput,
      customerOptions,
      selectedCustomers,
      showInactive,
      showMoreFilters,
      showNotBillable,
      checkEmployeeBillable,
      checkEmployeeAvailability,
      year,
      month
    };
  },
  head: {
    title: "Employees",
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
    padding-top: 0;
  }
}
</style>
