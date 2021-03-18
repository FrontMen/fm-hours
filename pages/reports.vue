<template>
  <div class="page-wrapper">
    <div class="content-wrapper my-5">
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
} from "@nuxtjs/composition-api";
import { format, addMonths, subMonths } from "date-fns";

import useMonthlyReport from "~/composables/useMonthlyReport";
import ReportsTable from "~/components/reports/reports-table.vue";

export default defineComponent({
  components: { ReportsTable },
  setup() {
    const { createFields, createItems } = useMonthlyReport();
    const monthDate = ref<Date>(new Date());

    const store = useStore<RootStoreState>();
    const report = computed(() => store.state.reports.report);
    const isLoading = computed(() => store.state.reports.isLoading);

    store.dispatch("reports/getMonthlyReport", { startDate: monthDate.value });

    const fields = computed(() => createFields(report.value));
    const items = computed(() => createItems(report.value));
    const fileName = computed(
      () => `Book ${format(monthDate.value, "MMMM-yyyy")}`
    );

    const goToPreviousMonth = () => {
      monthDate.value = subMonths(monthDate.value, 1);
      store.dispatch("reports/getMonthlyReport", {
        startDate: monthDate.value,
      });
    };

    const goToNextMonth = () => {
      monthDate.value = addMonths(monthDate.value, 1);
      store.dispatch("reports/getMonthlyReport", {
        startDate: monthDate.value,
      });
    };

    const goToCurrentMonth = () => {
      monthDate.value = new Date();
      store.dispatch("reports/getMonthlyReport", {
        startDate: monthDate.value,
      });
    };

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
