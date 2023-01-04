<template>
  <reports-table
    :busy="$store.state.reports.isLoading || !$store.getters['reports/projectItems'].length"
    :items="$store.getters['reports/projectItems']"
    :fields="[
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
      {key: 'project', sortable: true},
      {key: 'billable', sortable: true, variant: 'success'},
    ]"
    :csv-file-name="`projects-${formattedMonthDate}`"
  />
</template>

<script lang="ts">
import {computed, defineComponent, useStore} from "@nuxtjs/composition-api";
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
