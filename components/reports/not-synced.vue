<template>
  <reports-table
    :busy="$store.state.reports.isLoading || !$store.getters['reports/nonBillableItems'].length"
    :items="$store.getters['reports/notSynced']"
    :fields=" [
      {key: 'name', sortable: true},
      {key: 'date', sortable: true, formatter: formatDate},
      {key: 'team', sortable: true},
      {key: 'project', sortable: true},
      {key: 'hours', sortable: true},
    ]"
    :csv-file-name="`sync-issues-${formattedMonthDate}`"
  />
</template>

<script lang="ts">
import {defineComponent, useStore, computed} from "@nuxtjs/composition-api";
import { format } from 'date-fns';
import {formatToMonthYear} from "~/helpers/dates";

export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();

    const formatDate = (dateTime: Date | number): string => {
      return format(dateTime, 'dd-MMMM-yyyy');
    };

    return {
      formattedMonthDate: computed(() => formatToMonthYear(store.state.reports.startDate)),
      formatDate
    }
  }
})
</script>
