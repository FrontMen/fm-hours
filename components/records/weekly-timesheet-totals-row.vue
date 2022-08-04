<template>
  <b-row class="weekly-timesheet-totals-row" cols="14">
    <b-col class="weekly-timesheet__action-column" cols="4" />

    <b-col
      v-for="(value, index) in dayTotals"
      :key="index"
      cols="1"
      class="weekly-timesheet-totals-row__column"
    >
      <span>{{ value }} / {{ dayWorkSchemeHoursTotal[index] }}</span>
    </b-col>

    <!-- <b-col cols="1" class="weekly-timesheet-totals-row__week-column d-sm-block">
      <span>
        <strong>{{ weekTotal }} / {{ weekWorkSchemeHoursTotal }}</strong>
      </span>
    </b-col> -->
    <!-- <div class="progress blue mr-3">
      <span class="progress-left">
        <span class="progress-bar"></span>
      </span>
      <span class="progress-right">
        <span class="progress-bar"></span>
      </span>
      <div class="progress-value">{{ weekTotal }} / {{ weekWorkSchemeHoursTotal }}</div>
    </div> -->
    <b-col cols="auto" class="weekly-timesheet-row__total-column col-1 pr-2 pl-0">
      <b-progress :max="weekWorkSchemeHoursTotal" height="2.4rem">
        <b-progress-bar :value="weekTotal" :variant="'success'">
          <span>{{ weekTotal }} / {{ weekWorkSchemeHoursTotal }}</span>
        </b-progress-bar>
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
  .progress-bar span {
    font-size: 18px;
    font-weight: 500;
  }
}
</style>
