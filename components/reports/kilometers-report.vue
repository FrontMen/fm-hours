<template>
  <reports-table
    :busy="$store.state.reports.isLoading || !$store.getters['reports/kilometerItems'].length"
    :items="$store.getters['reports/kilometerItems']"
    :fields="[
      {key: 'name', sortable: true},
      {key: 'bridgeUid', sortable: false},
      {key: 'team', sortable: true},
      {key: 'kilometers', sortable: true},
    ]"
    :csv-file-name="`kilometers-${formattedMonthDate}`"
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
