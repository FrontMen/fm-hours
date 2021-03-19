<template>
  <b-row class="weekly-timesheet-totals-row" cols="14">
    <b-col cols="4">
      <b-button
        v-if="showAddProjectButton"
        v-b-modal.modal-add-project
        variant="primary"
      >
        <b-icon icon="plus-square-fill" class="mr-1" /> Project
      </b-button>
    </b-col>

    <!-- TODO: use classes and show {{ value / dayTheoraticalTotals[index] }} when `workSchem` API is implemented -->
    <b-col
      v-for="(value, index) in dayTotals"
      :key="index"
      cols="1"
      class="weekly-timesheet-totals-row__column"
    >
      <span>{{ value }}</span>
    </b-col>

    <!-- TODO: use classes and show {{ weekTotal / weekTheoraticalTotal }} when `workSchem` API is implemented -->
    <b-col
      cols="1"
      class="weekly-timesheet-totals-row__week-column d-none d-sm-block"
    >
      <span>
        <strong>{{ weekTotal }}</strong>
      </span>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api";

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
        total += project.values.reduce((prevValue, value) => prevValue + value);
      });

      return total;
    });

    const weekTheoreticalTotal = computed(() => {
      return props.workScheme.reduce(
        (prevValue, scheme) => prevValue + scheme.theoreticalHours,
        0
      );
    });

    const dayTotals = computed(() => {
      return props.selectedWeek.map((_, index) => {
        let total = 0;

        props.projects.forEach((project) => {
          total += project.values[index];
        });

        return total;
      });
    });

    const dayTheoreticalHours = computed(() => {
      return props.workScheme.map((scheme) => scheme.theoreticalHours);
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

  &__column {
    padding: 8px;
    text-align: center;

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

    &.exceeded {
      color: red;
    }
  }
}
</style>
