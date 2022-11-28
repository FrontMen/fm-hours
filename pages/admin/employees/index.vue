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

    <b-container fluid class="mb-3">
      <b-table
        class="row"
        responsive
        striped
        hover
        small
        :items="filteredEmployees"
        :fields="fields"
        :sort-compare="sortCompare"
        :sort-desc.sync="sortDescending"
        :sort-by.sync="sortKey"
        no-sort-reset
      >
        <template #head()="data">
          <div>
            {{ $t(data.label) }}
          </div>
        </template>

        <template #cell(status)="scope">
          <b-badge v-if="!checkEmployeeAvailability(scope.item, new Date())" variant="danger">
            {{ $t('inactive') }}
          </b-badge>
          <b-badge v-if="!checkEmployeeBillable(false, scope.item)" variant="warning">
            {{ $t('notBillable') }}
          </b-badge>
        </template>
        <template #cell(actions)="scope">
          <div class="text-right">
            <nuxt-link
              class="btn btn-sm btn-primary"
              :to="localePath(`/admin/employees/${scope.item.id}`)"
              :title="$t('manageEmployee')"
            >
              <b-icon icon="pencil-fill" />
            </nuxt-link>

            <b-dropdown size="sm" :text="$t('insights')" variant="primary" class="ml-2">
              <b-dropdown-item :to="localePath(`/insights/${scope.item.id}/${year}/`)">
                {{ $t("year") }}
              </b-dropdown-item>
              <b-dropdown-item :to="localePath(`/insights/${scope.item.id}/${year}/${month}`)">
                {{ $t("month") }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </template>
      </b-table>
    </b-container>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, useContext, useStore,} from "@nuxtjs/composition-api";

import {checkEmployeeAvailability} from "~/helpers/employee";
import {queryOnString, sortByProp} from "~/helpers/helpers";

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
          label: customer.name,
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
      employeeProjects: EmployeeProject[],
      selectedProjects: Customer[]
    ) => {
      if (!selectedProjects?.length) return true;
      if (!employeeProjects?.length) return false;

      return employeeProjects.some((employeeProject: EmployeeProject) => {
          return selectedProjects.some((project) => {
              return project.id === employeeProject.customerId;
          });
        }
      );
    };

    const sortDescending = ref<boolean>(false);
    const sortKey = ref<string>('');
    const fields = [
      {key: "name", label: "employees", sortable: true},
      {key: "team", label: "team", sortable: true},
      {key: "status", label: "status", sortable: false},
      {key: "actions", label: "actions", sortable: false, class: 'text-right'},
    ];
    const sortCompare = (a: Employee, b: Employee, key: keyof Employee) => sortByProp<Employee>(a, b, key);
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
      fields,
      sortCompare,
      sortDescending,
      sortKey,
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
