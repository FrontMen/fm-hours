<template>
  <div class="mx-5 my-5">
    <reports-table
      :busy="isLoading || !items.length"
      :items="items"
      :fields="fields"
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

    return {
      fields,
      items,
      isLoading,
    };
  },
});
</script>
