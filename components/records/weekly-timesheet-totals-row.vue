<template>
  <b-row class="weekly-timesheet-totals-row" cols="14">
    <b-col class="weekly-timesheet-totals-row__action" cols="4">
      <b-button
        v-if="showAddProjectButton"
        v-b-modal.modal-add-project
        variant="primary"
      >
        <b-icon icon="plus-square-fill" class="mr-1" />
        Project
      </b-button>
    </b-col>

    <b-col
      v-for="(value, index) in dayTotals"
      :key="index"
      cols="1"
      class="weekly-timesheet-totals-row__column"
    >
      <span>{{ value }} / {{ dayTheoreticalHours[index] }}</span>
    </b-col>

    <!-- TODO: use classes and show {{ weekTotal / weekTheoraticalTotal }} when `workSchem` API is implemented -->
    <b-col cols="1" class="weekly-timesheet-totals-row__week-column d-sm-block">
      <span>
        <strong>{{ weekTotal }} / {{ weekTheoreticalTotal }}</strong>
      </span>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "@nuxtjs/composition-api";
import {floatToTotalTimeString} from "~/helpers/timesheet";

export default defineComponent({
  props: {
    projects: {
      type: Array as PropType<TimesheetProject[]>,
      required: true,
    },
    selectedWeek: {
      type: Array as PropType<WeekDate[]>,
      required: true,
    },
    workScheme: {
      type: Array as PropType<WorkScheme[]>,
      required: true,
    },
    showAddProjectButton: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const weekTotal = computed(() => {
      let total = 0;

      props.projects.forEach((project) => {
        total += +project.values.reduce(
          (prevValue, value) => +prevValue + +value
        );
      });

      return floatToTotalTimeString(total);
    });

    const weekTheoreticalTotal = computed(() => {
      const total = props.workScheme.reduce(
        (prevValue, scheme) => prevValue + scheme.theoreticalHours,
        0
      );
      return total === 0 ? "-" : floatToTotalTimeString(total);
    });

    const dayTotals = computed(() => {
      return props.selectedWeek.map((_, index) => {
        let total = 0;

        props.projects.forEach((project) => {
          total += +project.values[index];
        });

        return total === 0 ? "-" : floatToTotalTimeString(total);
      });
    });

    const dayTheoreticalHours = computed(() => {
      return props.workScheme.map((scheme) => scheme.theoreticalHours === 0 ? "-" : floatToTotalTimeString(scheme.theoreticalHours));
    });

    return {
      weekTotal,
      weekTheoreticalTotal,
      dayTotals,
      dayTheoreticalHours,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-totals-row {
  align-items: center;
  padding-top: 8px;
  padding-bottom: 8px;

  &__action {
    @media (max-width: 560px) {
      flex: 100%;
      max-width: 100%;
    }
  }

  &__column {
    flex: 1;
    max-width: 100%;
    padding: 8px;
    text-align: center;

    @media (max-width: 560px) {
      flex: 1;
      max-width: 100%;
    }

    &.exceeded {
      color: red;
    }

    &.exceeded,
    &.valid {
      font-weight: bold;
    }
  }

  &__week-column {
    padding-right: 16px;
    text-align: right;
    padding: 0 4px;

    @media (min-width: 560px) {
      padding: 0 15px;
    }

    &.exceeded {
      color: red;
    }
  }
}
</style>
