<i18n lang="yaml">
en:
  employeeError: "Selected employee is not found"
nl:
  employeeError: "Geselecteerde medewerker is niet gevonden"
</i18n>
<template>
  <div class="mt-5 content-wrapper">
    <b-alert
      :show="showEmployeeError"
      dismissible
      variant="warning"
      class="mb-3"
    >
      {{$t('employeeError') }}
    </b-alert>

    <template v-if="employee">
      <employee-header :employee="employee" class="mb-5" />
      <weekly-timesheet :employee="employee" :year="year" :week="week" />
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useContext,
  useMeta,
  useRouter,
  useStore,
  ref,
} from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const showEmployeeError = ref(false);

    const employee = computed(() => {
      showEmployeeError.value = false;
      const employee = store.state.employees.employees.find(
        (employee: Employee) => employee.id === router.currentRoute.params.employee_id
      );
      if (!employee) {
        showEmployeeError.value = true;
        return;
      }
      return employee;
    });

    const year = computed(() => parseInt(router.currentRoute.params.year, 10));
    const week = computed(() => parseInt(router.currentRoute.params.week, 10));
    const pageTitle = computed(() =>`${i18n.t('timesheets')} - ${employee.value?.name}`);

    store.dispatch('employees/getEmployees');
    store.dispatch('customers/getCustomers');

    useMeta(() => ({
      title: pageTitle.value,
    }));

    return {
      employee,
      year,
      week,
      showEmployeeError
    };
  },

  head: {},
});
</script>
