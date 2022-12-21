<template>
  <reports-table
    :busy="$store.state.reports.isLoading || !$store.getters['reports/standByItems'].length"
    :items="$store.getters['reports/standByItems']"
    :fields="[
      {key: 'name', sortable: true},
      {key: 'bridgeUid', sortable: false},
      {key: 'team', sortable: true},
      {key: 'hours', sortable: true},
    ]"
    :csv-file-name="`${$t('standBy')}-${formattedMonthDate}`"
  />
</template>

<script lang="ts">
import {computed, defineComponent, useStore} from "@nuxtjs/composition-api";
import {formatToMonthYear} from "~/helpers/dates";

export default defineComponent({
  name: 'StandByReport',
  setup() {
    const store = useStore<RootStoreState>();
    return {
      formattedMonthDate: computed(() => formatToMonthYear(store.state.reports.startDate))
    }
  }
})
</script>
