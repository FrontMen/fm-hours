<template>
  <weekly-timesheet-row
    :value-formatter="timesheetFormatter"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
import {timesheetFormatter} from "~/helpers/timesheet";

export default defineComponent({
  setup() {
    return {
      timesheetFormatter: timesheetFormatter(24)
    }
  }
});
</script>
