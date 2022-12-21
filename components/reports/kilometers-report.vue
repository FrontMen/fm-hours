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
    :csv-file-name="`${$t('kilometers')}-${formattedMonthDate}`"
  />
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  name: 'KilometersReport',
  props: {
    formattedMonthDate: {
      type: String,
      required: true,
    }
  }
})
</script>
