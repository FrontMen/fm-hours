<i18n lang="yaml">
en:
  totals: "Totals"
  standBy: "Stand-by"
  notBillable: "Not billable"
nl:
  totals: "Totalen"
  standBy: "Stand-by"
  notBillable: "Niet billable"
</i18n>

<template>
  <div class="mt-5 content-wrapper">
    <YearPicker v-model="year" />
    <month-navigation-buttons
      class="mb-4"
      :selected-date="monthDate"
      :select-year="true"
      @previous="goToPreviousMonth"
      @next="goToNextMonth"
      @current="goToCurrentMonth"
    />

    <reports-table
      :busy="isLoading || !projectsItems.length"
      :items="projectsItems"
      :fields="projectsFields"
      :csv-file-name="`projects-${formattedMonthDate}`"
    />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, useContext, useMeta, useStore, watch,} from '@nuxtjs/composition-api';
import {addMonths, format, subMonths, startOfYear, endOfYear} from 'date-fns';

import useMonthlyTotalsReport from '~/composables/useMonthlyTotalsReport';
import useMonthlyProjectsReport from '~/composables/useMonthlyProjectsReport';
import useMonthlyStandByReport from '~/composables/useMonthlyStandbyReport';

export default defineComponent({
  setup() {
    const {i18n} = useContext();

    useMeta(() => ({
      title: i18n.t('insights') as string,
    }));

    const {createTotalsFields, createTotalsItems} = useMonthlyTotalsReport();
    const {createProjectsFields, createProjectsItems} =
      useMonthlyProjectsReport();
    const { createStandByItems} = useMonthlyStandByReport();

    const yearStart = ref<Date>(startOfYear(new Date()));
    const yearEnd = ref<Date>(endOfYear(new Date()));

    const year = ref<Date>(new Date());

    const store = useStore<RootStoreState>();
    const reportData = computed(() => {
      return store.state.reports.reportData;
    });
    const isLoading = computed(() => store.state.reports.isLoading);

    const totalsFields = computed(() => createTotalsFields(reportData.value));
    const totalsItems = computed(() => createTotalsItems(reportData.value));

    const projectsFields = createProjectsFields();
    const projectsItems = computed(() => createProjectsItems(reportData.value));

    const standByItems = computed(() => createStandByItems(reportData.value));

    const monthDate = ref<Date>(new Date());

    const formattedMonthDate = computed(() =>
      format(monthDate.value as Date, 'MM-yyyy')
    );

    const goToPreviousMonth = () => {
      monthDate.value = subMonths(monthDate.value as Date, 1);
    };

    const goToNextMonth = () => {
      monthDate.value = addMonths(monthDate.value as Date, 1);
    };

    const goToCurrentMonth = () => {
      monthDate.value = new Date();
    };

    watch(
      monthDate,
      () => {
        store.dispatch('reports/getMonthlyReportData', {
          startDate: yearStart.value,
          endDate: yearEnd.value,
        });
        store.dispatch('insights/getMonthlyTimeInsights', {
          employeeId: store?.state?.auth?.user?.uid,
          startDate: yearStart.value,
          endDate: yearEnd.value
        });
      },
      {immediate: true}
    );

    return {
      monthDate,
      formattedMonthDate,
      totalsFields,
      totalsItems,
      projectsFields,
      projectsItems,
      standByItems,
      isLoading,
      year,
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
    };
  },
  head: {
    title: 'Insights',
  },
});
</script>
