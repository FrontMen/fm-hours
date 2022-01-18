<i18n lang="yaml">
en:
  employeeError: "Selected employee is not found"
nl:
  employeeError: "Geselecteerde medewerker is niet gevonden"
</i18n>
<template>
  <div class="mt-2 content-wrapper">
    <b-alert
      :show="showEmployeeError"
      dismissible
      variant="warning"
      class="mb-3"
    >
      {{ $t('employeeError') }}
    </b-alert>

    <template v-if="employee">
      <weekly-timesheet
        :key="`${employee.id}-${year}-${week}`"
        :employee="employee"
        :year="year"
        :week="week"
        :is-admin="true"
        :route-prefix="routePrefix"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useContext,
  useMeta,
  useStore,
  ref,
  useRoute,
} from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const route = useRoute();
    const store = useStore<RootStoreState>();

    const showEmployeeError = ref(false);

    const employee = computed(() => {
      showEmployeeError.value = false;
      const employee = store.state.employees.employees.find(
        (employee: Employee) => employee.id === route.value.params.employee_id
      );
      if (!employee) {
        showEmployeeError.value = true;
        return;
      }
      return employee;
    });

    const year = computed(() => parseInt(route.value.params.year, 10));
    const week = computed(() => parseInt(route.value.params.week, 10));
    const pageTitle = computed(() => `${i18n.t('timesheets')} - ${employee.value?.name}`);
    const routePrefix = computed(() => `/admin/timesheets/${employee.value?.id}`);

    // TODO: Overview should retrieve all employees
    store.dispatch('employees/getEmployees');

    useMeta(() => ({
      title: pageTitle.value,
    }));

    return {
      employee,
      year,
      week,
      showEmployeeError,
      routePrefix
    };
  },

  head: {},
});
</script>
