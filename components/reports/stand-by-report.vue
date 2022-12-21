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
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  name: 'StandByReport',
  props: {
    formattedMonthDate: {
      type: String,
      required: true,
    }
  }
})
</script>
