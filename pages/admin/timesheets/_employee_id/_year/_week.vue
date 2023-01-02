<i18n lang="yaml">
en:
  employeeError: "Selected employee is not found"
nl:
  employeeError: "Geselecteerde medewerker is niet gevonden"
</i18n>
<template>
  <div>
    <b-alert :show="showEmployeeError" dismissible variant="warning" class="mb-3">
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
  useRoute,
} from '@nuxtjs/composition-api';
import {useEmployees} from "~/composables/useEmployees";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const route = useRoute();

    const {employeeByRouteParamId: employee, showEmployeeError} = useEmployees();

    const year = computed(() => parseInt(route.value.params.year, 10));
    const week = computed(() => parseInt(route.value.params.week, 10));
    const pageTitle = computed(() => `${i18n.t('timesheets')} - ${employee.value?.name}`);
    const routePrefix = computed(() => `/admin/timesheets/${employee.value?.id}`);

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
