<template>
  <b-row class="weekly-timesheet-totals-row" cols="14">
    <b-col cols="4">
      <b-button
        v-if="showAddProjectButton"
        v-b-modal.modal-add-project
        variant="primary"
      >
        Add project
      </b-button>
    </b-col>

    <b-col
      v-for="(value, index) in dayTotals"
      :key="index"
      cols="1"
      class="weekly-timesheet-totals-row__column"
    >
      <span>{{ value }}</span>
    </b-col>

    <b-col cols="1" class="weekly-timesheet-totals-row__week-column d-none d-sm-block">
      <span>
        <strong>
          {{ weekTotal }}
        </strong>
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
    showAddProjectButton: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const weekTotal = computed(() => {
      let total = 0;

      props.projects.forEach((project) => {
        total += project.values.reduce((prevValue, value) => prevValue + value);
      });

      return total;
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

    return {
      weekTotal,
      dayTotals,
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
  }

  &__week-column {
    padding-right: 16px;
    text-align: right;
  }
}
</style>
