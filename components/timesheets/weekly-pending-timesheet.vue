<template>
  <div class="weekly-pending-timesheet">
    <h2 class="weekly-pending-timesheet__week-label mb-4">
      {{ weekLabel }}
    </h2>

    <weekly-timesheet :selected-week="week">
      <template #rows>
        <weekly-timesheet-row
          v-for="(project, index) in timesheet.projects"
          :key="project.customer.id"
          :project="timesheet.projects[index]"
          :readonly="true"
          :removeable="false"
          :selected-week="week"
          :value-formatter="timesheetFormatter"
        />

        <weekly-timesheet-totals-row
          :projects="timesheet.projects"
          :selected-week="week"
          :work-scheme="workScheme"
          :show-add-project-button="false"
        />
      </template>
    </weekly-timesheet>

    <template v-if="timesheet.travelProject">
      <h3 class="my-4">Travel allowance</h3>

      <weekly-timesheet :selected-week="week">
        <template #rows>
          <weekly-timesheet-row
            :project="timesheet.travelProject"
            :readonly="true"
            :removable="false"
            :selected-week="week"
            :value-formatter="kilometerFormatter"
          />
        </template>
      </weekly-timesheet>
    </template>

    <b-container fluid class="weekly-pending-timesheet__buttons mt-4 mb-4">
      <b-button variant="danger" :disabled="false" @click="handleDenyClick">
        Deny
      </b-button>

      <b-button variant="success" :disabled="false" @click="handleApproveClick">
        Approve
      </b-button>
    </b-container>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api";

import WeeklyTimesheetRow from "~/components/records/weekly-timesheet-row.vue";
import WeeklyTimesheetTotalsRow from "~/components/records/weekly-timesheet-totals-row.vue";

import { getWeekRange, getDateLabel } from "~/helpers/dates";
import { timesheetFormatter, kilometerFormatter } from "~/helpers/timesheet";

export default defineComponent({
  components: {
    WeeklyTimesheetRow,
    WeeklyTimesheetTotalsRow,
  },
  emits: ["approve", "deny"],
  props: {
    week: {
      type: Array as PropType<WeekDate[]>,
      required: true,
    },
    timesheet: {
      type: Object as PropType<WeeklyTimesheet>,
      required: true,
    },
    workScheme: {
      type: Array as PropType<WorkScheme[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const weekLabel = computed(() => {
      if (!props.week.length) return "";

      const firstDate = props.week[0].date;
      const { start, end } = getWeekRange(firstDate);

      return getDateLabel(start, end);
    });

    const handleDenyClick = () => emit("deny");
    const handleApproveClick = () => emit("approve");

    return {
      weekLabel,
      handleDenyClick,
      handleApproveClick,
      timesheetFormatter: timesheetFormatter(24),
      kilometerFormatter: kilometerFormatter(0, 9999),
    };
  },
});
</script>

<style lang="scss">
.weekly-pending-timesheet {
  &__week-label {
    font-size: 18px;
    font-weight: bold;

    @media (min-width: 576px) {
      font-size: 24px;
    }
  }

  &__buttons {
    text-align: right;
    padding: 0;
  }
}
</style>
