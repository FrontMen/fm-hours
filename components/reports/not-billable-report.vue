<template>
  <reports-table
    :busy="$store.state.reports.isLoading || !$store.getters['reports/nonBillableItems'].length"
    :items="$store.getters['reports/nonBillableItems']"
    :fields=" [
      {key: 'name', sortable: true},
      {key: 'team', sortable: true},
    ]"
    :csv-file-name="`${$t('notBillable')}-${formattedMonthDate}`"
  />
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  name: 'NotBillableReport',
  props: {
    formattedMonthDate: {
      type: String,
      required: true,
    }
  },
})
</script>
