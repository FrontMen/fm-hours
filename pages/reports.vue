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

      <reports-table
        :busy="isLoading || !items.length"
        :items="items"
        :fields="fields"
        :csv-file-name="fileName"
      />
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
import ReportsTable from "~/components/reports/reports-table.vue";

export default defineComponent({
  components: { ReportsTable },
  setup() {
    const { createFields, createItems } = useMonthlyTotalsReport();
    const monthDate = ref<Date>(new Date());

    const store = useStore<RootStoreState>();
    const reportData = computed(() => store.state.reports.reportData);
    const isLoading = computed(() => store.state.reports.isLoading);

    const fields = computed(() => createFields(reportData.value));
    const items = computed(() => createItems(reportData.value));
    const fileName = computed(
      () => `Book ${format(monthDate.value, "MMMM-yyyy")}`
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
      fields,
      items,
      fileName,
      isLoading,
      goToPreviousMonth,
      goToNextMonth,
      goToCurrentMonth,
    };
  },
});
</script>
