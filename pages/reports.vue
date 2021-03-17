<template>
  <div class="content-wrapper mt-5">
    <reports-table
      :busy="isLoading || !items.length"
      :items="items"
      bordered
      table-variant="light"
      striped
      hover
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
} from "@nuxtjs/composition-api";

import ReportsTable from "~/components/reports/reports-table.vue";

export default defineComponent({
  components: { ReportsTable },
  setup() {
    const store = useStore<RootStoreState>();
    const monthDate = ref<Date>(new Date());
    const report = computed(() => store.state.reports.report);
    const isLoading = computed(() => store.state.reports.isLoading);

    store.dispatch("reports/getMonthlyReport", { startDate: monthDate.value });

    const items = computed(() => {
      if (!report.value || !report.value.users) return [];

      return report.value.users.map((entry) => {
        const nonBillableColumns = report.value?.nonBillableProjects.reduce(
          (total: any, current) => {
            total[current.name] = entry.nonBillableProjects
              .filter((x) => x.customerId === current.id)
              .reduce((total, y) => (total += y.hours), 0);

            return total;
          },
          {}
        );

        return {
          name: entry.name,
          billable: entry.billableHours || 0,
          ...nonBillableColumns,
        };
      });
    });

    return {
      items,
      isLoading,
    };
  },
});
</script>
