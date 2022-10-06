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
    <date-navigation-buttons
      class="mb-4"
      :selected-date="monthDate"
      @previous="goToPreviousMonth"
      @next="goToNextMonth"
      @current="goToCurrentMonth"
    />

    <b-tabs pills>
      <b-tab :title="$t('totals')" active lazy>
        <reports-table
          :busy="isLoading || !totalsItems.length"
          :items="totalsItems"
          :fields="totalsFields"
          :csv-file-name="`${$t('totals')}-${formattedMonthDate}`"
        />
      </b-tab>

      <b-tab :title="$t('projects')" lazy>
        <reports-table
          :busy="isLoading || !projectsItems.length"
          :items="projectsItems"
          :fields="projectsFields"
          :csv-file-name="`projects-${formattedMonthDate}`"
        />
      </b-tab>

      <b-tab :title="$t('kilometers')" lazy>
        <reports-table
          :busy="isLoading || !kilometersItems.length"
          :items="kilometersItems"
          :fields="kilometersFields"
          :csv-file-name="`${$t('kilometers')}-${formattedMonthDate}`"
        />
      </b-tab>

      <b-tab :title="$t('standBy')" lazy>
        <reports-table
          :busy="isLoading || !standByItems.length"
          :items="standByItems"
          :fields="standByFields"
          :csv-file-name="`${$t('standBy')}-${formattedMonthDate}`"
        />
      </b-tab>

      <b-tab :title="$t('notBillable')" lazy>
        <reports-table
          :busy="isLoading || !nonBillableItems.length"
          :items="nonBillableItems"
          :fields="nonBillableFields"
          :csv-file-name="`${$t('notBillable')}-${formattedMonthDate}`"
        />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref, useContext, useMeta, useStore, watch,} from '@nuxtjs/composition-api';
import {addMonths, format, subMonths} from 'date-fns';

import useMonthlyTotalsReport from '~/composables/useMonthlyTotalsReport';
import useMonthlyProjectsReport from '~/composables/useMonthlyProjectsReport';
import useMonthlyKilometersReport from '~/composables/useMonthlyKilometersReport';
import useMonthlyStandByReport from '~/composables/useMonthlyStandbyReport';
import useMonthlyNotBillableReport from "~/composables/useMonthlyNotBillableReport";

export default defineComponent({
  setup() {
    const {i18n} = useContext();

    useMeta(() => ({
      title: i18n.t('reports') as string,
    }));

    const {createTotalsFields, createTotalsItems} = useMonthlyTotalsReport();
    const {createProjectsFields, createProjectsItems} =
      useMonthlyProjectsReport();
    const {createStandByFields, createStandByItems} = useMonthlyStandByReport();
    const {createNotBillableFields, createNotBillableItems} = useMonthlyNotBillableReport();

    const {createKilometersFields, createKilometersItems} =
      useMonthlyKilometersReport();

    const monthDate = ref<Date>(new Date());

    const store = useStore<RootStoreState>();
    const reportData = computed(() => {
      return store.state.reports.reportData;
    });
    const isLoading = computed(() => store.state.reports.isLoading);

    const totalsFields = computed(() => createTotalsFields(reportData.value));
    const totalsItems = computed(() => createTotalsItems(reportData.value));

    const projectsFields = createProjectsFields();
    const projectsItems = computed(() => createProjectsItems(reportData.value));

    const standByFields = computed(() => createStandByFields());
    const standByItems = computed(() => createStandByItems(reportData.value));

    const nonBillableFields = computed(() => createNotBillableFields());
    const nonBillableItems = computed(() => createNotBillableItems(reportData.value));

    const kilometersFields = createKilometersFields();
    const kilometersItems = computed(() =>
      createKilometersItems(reportData.value)
    );

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
          startDate: monthDate.value,
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
      standByFields,
      standByItems,
      kilometersFields,
      kilometersItems,
      nonBillableFields,
      nonBillableItems,
      isLoading,
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
    };
  },
  head: {
    title: 'Reportssss',
  },
});
</script>
