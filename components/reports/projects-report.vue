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
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  name: 'ProjectsReport',
  props: {
    formattedMonthDate: {
      type: String,
      required: true,
    }
  }
})
</script>
