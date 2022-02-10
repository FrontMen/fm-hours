<template>
  <weekly-timesheet-row :value-formatter="timesheetFormatter" v-bind="$attrs" v-on="$listeners" />
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
import {timesheetFormatter} from "~/helpers/timesheet";

export default defineComponent({
  setup() {
    const MAX_HOURS_PER_DAY = 24;

    return {
      timesheetFormatter: timesheetFormatter(MAX_HOURS_PER_DAY)
    }
  }
});
</script>
