<template>
  <weekly-timesheet-row
    :value-formatter="kilometerFormatter"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
import {kilometerFormatter} from "~/helpers/timesheet";

export default defineComponent({
  setup() {
    return {
      kilometerFormatter: kilometerFormatter(0, 9999),
    }
  }
});
</script>
