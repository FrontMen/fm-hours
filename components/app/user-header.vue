<template>
  <b-row no-gutters align-v="center">
    <b-col cols="0" class="mr-2">
      <b-avatar :src="user.picture" />
    </b-col>

    <b-col>
      <div class="font-weight-bold">
        {{ user.name }}
      </div>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User | TimesheetUser>,
      required: true,
    },
  },
});
</script>
