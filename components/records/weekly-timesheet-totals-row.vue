<template>
  <b-row class="weekly-timesheet-totals-row" cols="14">
    <b-col class="weekly-timesheet__action-column" cols="0" md="4" />

    <b-col
      v-for="(value, index) in dayTotals"
      :key="index"
      cols="auto"
      md="1"
      class="weekly-timesheet-totals-row__column"
    >
      <span>{{ value }} / {{ dayWorkSchemeHoursTotal[index] }}</span>
    </b-col>

    <b-col cols="auto" class="weekly-timesheet-row__total-column col-2 col-md-1 pr-2 pl-0">
      <b-progress :max="40" height="2.4rem">
        <b-progress-bar :value="weekTotal" :variant="'success'"></b-progress-bar>
        <span class="progressbar-title">{{ weekTotal }} / {{ 40 }}</span>
      </b-progress>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, watch} from "@nuxtjs/composition-api";

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
    }
  },
  emits: ["totals"],
  setup(props, {emit}) {
    const weekTotal = computed(() => {
      let total = 0;

      props.projects.forEach((project) => {
        total += +project.values.reduce(
          (prevValue, value) => +prevValue + +value
        );
      });

      return total;
    });

    const weekWorkSchemeHoursTotal = computed(() => props.workScheme.reduce(
      (prevValue, scheme) => prevValue + scheme.workHours,
      0
    ));

    const dayTotals = computed(() => {
      return props.selectedWeek.map((_, index) => {
        let total = 0;

        props.projects.forEach((project) => {
          total += +project.values[index];
        });

        return total;
      });
    });

    const dayWorkSchemeHoursTotal = computed(() =>
      props.selectedWeek.map((_, index) =>
        props.workScheme?.[index] ? props.workScheme[index].workHours : "0")
    );

    watch(
      () => [weekTotal.value],
      () => {
        const totals: TimesheetTotals = {
          weekTotal: weekTotal.value,
          expectedWeekTotal: weekWorkSchemeHoursTotal.value,
          dayTotal: dayTotals.value,
        };

        emit('totals', totals);
      },
      {immediate: true}
    );

    return {
      weekTotal,
      weekWorkSchemeHoursTotal,
      dayTotals,
      dayWorkSchemeHoursTotal,
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
    flex: 1;
    max-width: 100%;
    padding: 8px;
    text-align: center;
    font-size: 17px;
    font-weight: 500;

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
    text-align: right;
    padding: 0 4px;

    @media (min-width: 560px) {
      padding: 0 15px;
    }

    &.exceeded {
      color: red;
    }
  }

  .progressbar {
    position: relative;
  }

  .progressbar-title {
    position: absolute;
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    line-height: 40px;
    overflow: hidden;
    color: var(--body-color);
    right: 0;
    left: 0;
    top: 0;
  }
}
</style>
