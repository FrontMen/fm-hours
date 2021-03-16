<template>
  <b-container class="timesheet-user-header pt-3 pb-2">
    <b-row v-if="user" no-gutters align-v="center">
      <b-col cols="0" class="mr-2">
        <b-avatar :src="user.picture" />
      </b-col>

      <b-col>
        <div class="font-weight-bold">
          {{ user.name }}
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<TimesheetUser>,
      required: true,
    },
  },
});
</script>

<style lang="scss">
.timesheet-user-header {
  background-color: #84cac9;
  border-right: 1px solid #84cac9;
  border-bottom: 8px solid #84cac9;
  border-left: 1px solid #84cac9;
  border-radius: 8px;
}
</style>
