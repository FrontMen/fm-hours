<template>
  <reports-table
    :busy="$store.state.reports.isLoading || !$store.getters['reports/totalsItems']?.length"
    :items="$store.getters['reports/totalsItems']"
    :fields="fields"
    :csv-file-name="`${$t('totals')}-${formattedMonthDate}`"
  />
</template>

<script lang="ts">
import {computed, defineComponent, useStore} from "@nuxtjs/composition-api";

export default defineComponent({
  name: 'TotalsReport',
  props: {
    formattedMonthDate: {
      type: String,
      required: true,
    }
  },
  setup() {
    const store = useStore<RootStoreState>();

    const fields = computed(() => {
      const leftFields = [
        {key: 'name', sortable: true},
        {key: 'team', sortable: true},
        {key: 'totalHours', sortable: true, variant: 'info'},
        {key: 'billable', sortable: true, variant: 'success'},
        {key: 'nonBillable', sortable: true, variant: 'warning'},
      ];

      const middleFields = store.state.reports.reportData.nonBillableProjects.map((project) => ({
        key: project.name,
        sortable: true,
      }));

      const rightFields = [{key: 'productivity', sortable: true, variant: 'info'}];

      return [...leftFields, ...(middleFields || []), ...rightFields]
    })

    return {
      fields
    };
  }
})
</script>
