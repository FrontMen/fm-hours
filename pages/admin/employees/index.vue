<i18n lang="yaml">
en:
  showInactive: "Show inactive"
  showNotBillable: "Show not billable"
  notBillable: "Not billable"
  noEmployeeFound: "No employee found"
  inactive: "Inactive"
  manageEmployee: "Manage employee"
  addEmployee: "Add an employee"
nl:
  showInactive: "Toon inactieve"
  showNotBillable: "Toon niet billable"
  notBillable: "Niet billable"
  noEmployeeFound: "Geen medewerker(s) gevonden"
  inactive: "Inactief"
  manageEmployee: "Medewerker bewerken"
  addEmployee: "Medewerker toevoegen"
</i18n>

<template>
  <admin-container>
    <b-container fluid class="mb-3">
      <b-row class="justify-content-between">
        <b-col cols="6" class="pl-0 d-flex align-items-center">
          <b-form-group class="mb-0 mr-4">
            <b-input-group>
              <b-form-input
                id="filter-input"
                v-model="filter"
                type="search"
                :placeholder="$t('filter')"
              />

              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">
                  {{ $t('clear') }}
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

          <b-form-checkbox v-model="includeInactive" switch class="mr-4">
            {{ $t('showInactive') }}
          </b-form-checkbox>
          <b-form-checkbox v-model="includeNonBillable" switch>
            {{ $t('showNotBillable') }}
          </b-form-checkbox>
        </b-col>
        <b-col cols="auto">
          <nuxt-link class="btn btn-primary" :to="localePath(`/admin/employees/add`)">
            {{ $t('addEmployee') }}
            <b-icon icon="person" />
          </nuxt-link>
        </b-col>
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
        :filter="filter"
      >
        <template #head()="data">
          {{ $t(data.label) }}
        </template>

        <template #cell(active)="scope">
          <b-badge :variant="scope.item.active ? 'info' : 'warning'">
            {{ scope.item.active ? $t('yes') : $t('no') }}
          </b-badge>
        </template>
        <template #cell(billable)="scope">
          <b-badge :variant="scope.item.billable ? 'info' : 'warning'">
            {{ scope.item.billable ? $t('yes') : $t('no') }}
          </b-badge>
        </template>
        <template #cell(freelancer)="scope">
          <b-badge :variant="scope.item.freelancer ? 'info' : 'warning'">
            {{ scope.item.freelancer ? $t('yes') : $t('no') }}
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
  </admin-container>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  useContext,
  useMeta,
  useStore,
} from '@nuxtjs/composition-api';

import {useEmployees} from "~/composables/useEmployees";
import {checkEmployeeAvailability} from "~/helpers/employee";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();
    const { employees } = useEmployees();
    const teams = computed(() => store.state.teams.teams);

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    useMeta(() => ({
      title: i18n.t('employees') as string,
    }));

    onMounted(() => {
      store.dispatch('teams/get');
    });

    const filter = ref<string>('');
    const includeInactive = ref<boolean>(false);
    const includeNonBillable = ref<boolean>(false);

    const fields = [
      {key: 'name', label: 'employees', sortable: true},
      {
        key: 'team',
        label: 'team',
        sortable: true,
        formatter: (teamId: String) => {
          if (!teamId) return '-';
          return teams.value.find(t => t.id === teamId)?.name;
        },
      },
      {key: 'email', label: 'email', sortable: false},
      {key: 'active', label: 'active', sortable: false, class: 'text-center'},
      {key: 'billable', label: 'billable', sortable: false, class: 'text-center'},
      {key: 'freelancer', label: 'freelancer', sortable: false, class: 'text-center'},
      {key: 'actions', label: 'actions', sortable: false, class: 'text-right'},
    ];

    const applyEmployeeFilters = ({ active: isActive, billable: isBillable }: Employee) => {
      return (isActive || includeInactive.value) && (isBillable || includeNonBillable.value)
    }

    const filteredEmployees = computed(() =>
      employees.value
        .map((employee: Employee) => ({
          ...employee,
          active: checkEmployeeAvailability(employee, new Date()),
        }))
        .filter(applyEmployeeFilters)
    );

    return {
      filter,
      includeInactive,
      includeNonBillable,
      fields,
      filteredEmployees,
      year,
      month,
    };
  },
  head: {},
});
</script>
