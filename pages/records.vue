<template>
  <div class="content-wrapper mt-5">
    <navigation-buttons
      class="mb-4"
      :selected-week="recordsState.selectedWeek"
      @previous="goToPreviousWeek()"
      @next="goToNextWeek()"
      @current="goToCurrentWeek()"
    />

    <empty-timesheet
      v-if="!recordsState.timeRecords.length"
      @copy-previous-week="() => console.log('test')"
    />

    <weekly-timesheet v-else :selected-week="recordsState.selectedWeek" />

    <!-- render rows inside rows template (v-model per timesheet row) -->
    <!-- render totals inside totals template -->

    <!-- render timesheet on v-if travelAllowence -->
    <!-- render row inside rows template v-model on timesheet.travelRecords -->

    <!-- <select-project-dialog
      :projects="selectableCustomers"
      @project-selected="addProject"
    /> -->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useStore } from "@nuxtjs/composition-api";
import emptyTimesheet from "~/components/records/empty-timesheet.vue";

import { generateValueFormatter } from "~/helpers/records";

export default defineComponent({
  components: { emptyTimesheet },
  setup() {
    const store = useStore<RootStoreState>();

    store.dispatch("customers/getCustomers");
    store.dispatch("records/getRecords", {
      startDate: new Date(),
    });

    const selectableCustomers = computed(
      () => store.getters["customers/getSelectableCustomers"]
    );

    // TODO: grab timesheet from recordsState
    // TODO: watch this and convert to local value
    // TODO: watch local value and watch on debounce to save
    // TODO: disable local inputs while saving

    const timesheetFormatter = () => generateValueFormatter(0, 24);

    return {
      selectableCustomers,
      recordsState: computed(() => store.state.records),
      timesheetFormatter,
    };
  },
});
</script>
