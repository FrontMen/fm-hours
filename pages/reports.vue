<template>
  <div class="page-wrapper">
    <div class="my-5 mx-5">
      <month-navigation-buttons
        class="mb-4"
        :selected-date="monthDate"
        @previous="goToPreviousMonth"
        @next="goToNextMonth"
        @current="goToCurrentMonth"
      />

      <b-tabs pills card>
        <b-tab title="Totals" active>
          <reports-table
            :busy="isLoading || !totalsItems.length"
            :items="totalsItems"
            :fields="totalsFields"
            :csv-file-name="`totals-${formattedMonthDate}`"
          />
        </b-tab>

        <b-tab title="Projects">
          <reports-table
            :busy="isLoading || !projectsItems.length"
            :items="projectsItems"
            :fields="projectsFields"
            :csv-file-name="`projects-${formattedMonthDate}`"
          />
        </b-tab>

        <b-tab title="Kilometers">
          <reports-table
            :busy="isLoading || !kilometersItems.length"
            :items="kilometersItems"
            :fields="kilometersFields"
            :csv-file-name="`kilometers-${formattedMonthDate}`"
          />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
  watch,
} from "@nuxtjs/composition-api";
import { format, addMonths, subMonths } from "date-fns";

import useMonthlyTotalsReport from "~/composables/useMonthlyTotalsReport";
import useMonthlyProjectsReport from "~/composables/useMonthlyProjectsReport";
import useMonthlyKilometersReport from "~/composables/useMonthlyKilometersReport";

import ReportsTable from "~/components/reports/reports-table.vue";

export default defineComponent({
  components: { ReportsTable },
  setup() {
    const { createTotalsFields, createTotalsItems } = useMonthlyTotalsReport();
    const {
      createProjectsFields,
      createProjectsItems,
    } = useMonthlyProjectsReport();

    const {
      createKilometersFields,
      createKilomtersItems,
    } = useMonthlyKilometersReport();

    const monthDate = ref<Date>(new Date());

    const store = useStore<RootStoreState>();
    const reportData = computed(() => store.state.reports.reportData);
    const isLoading = computed(() => store.state.reports.isLoading);

    const totalsFields = computed(() => createTotalsFields(reportData.value));
    const totalsItems = computed(() => createTotalsItems(reportData.value));

    const projectsFields = createProjectsFields();
    const projectsItems = computed(() => createProjectsItems(reportData.value));

    const kilometersFields = createKilometersFields();
    const kilometersItems = computed(() =>
      createKilomtersItems(reportData.value)
    );

    const formattedMonthDate = computed(() =>
      format(monthDate.value, "MM-yyyy")
    );

    const goToPreviousMonth = () => {
      monthDate.value = subMonths(monthDate.value, 1);
    };

    const goToNextMonth = () => {
      monthDate.value = addMonths(monthDate.value, 1);
    };

    const goToCurrentMonth = () => {
      monthDate.value = new Date();
    };

    watch(
      () => monthDate.value,
      () => {
        store.dispatch("reports/getMonthlyReportData", {
          startDate: monthDate.value,
        });
      },
      { immediate: true }
    );

    return {
      monthDate,
      formattedMonthDate,
      totalsFields,
      totalsItems,
      projectsFields,
      projectsItems,
      kilometersFields,
      kilometersItems,
      isLoading,
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
    };
  },
});
</script>
