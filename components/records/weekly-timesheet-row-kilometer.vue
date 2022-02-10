<template>
  <weekly-timesheet-row :value-formatter="kilometerFormatter" v-bind="$attrs" v-on="$listeners" />
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
import {kilometerFormatter} from "~/helpers/timesheet";

export default defineComponent({
  setup() {
    const MAX_KILOMETERS_PER_DAY = 9999;

    return {
      kilometerFormatter: kilometerFormatter(0, MAX_KILOMETERS_PER_DAY),
    }
  }
});
</script>
