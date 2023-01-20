<template>
  <reports-table
    :busy="$store.state.reports.isLoading || !$store.getters['reports/nonBillableItems'].length"
    :items="$store.getters['reports/nonBillableItems']"
    :fields=" [
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
    ]"
    :csv-file-name="`not-billable-${formattedMonthDate}`"
  />
</template>

<script lang="ts">
import {defineComponent, useStore, computed} from "@nuxtjs/composition-api";
import {formatToMonthYear} from "~/helpers/dates";

export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();
    return {
      formattedMonthDate: computed(() => formatToMonthYear(store.state.reports.startDate))
    }
  }
})
</script>
