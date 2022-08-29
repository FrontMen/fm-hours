<i18n lang="yaml">
en:
  weekend-hours: "Some hours aren't visible because the weekend is hidden"
nl:
  weekend-hours: "Sommige uren zijn niet zichtbaar omdat het weekend verborgen is"
</i18n>
<template>
  <b-row class="weekly-timesheet-totals-row" cols="14">
    <b-col class="weekly-timesheet__action-column" cols="0" md="4" />

    <b-col
      v-for="info in daysFiltered"
      :key="info.day.date"
      cols="auto"
      md="1"
      class="weekly-timesheet-totals-row__column"
    >
      <span>{{ info.hours }} / {{ info.expected }}</span>
    </b-col>

    <b-col cols="auto" class="weekly-timesheet-row__total-column col-2 col-md-1 pr-2 pl-0">
      <b-progress :max="40" height="2.4rem">
        <b-progress-bar :value="weekTotal" :max="expectedWeekTotal"></b-progress-bar>
        <span class="progressbar-title">{{ weekTotal }} / {{ expectedWeekTotal }}</span>
      </b-progress>
      <span
        v-if="hasWeekendHours && !showWeekends"
        v-b-tooltip.hover="{ variant: 'light' }"
        class="weekend-hours"
        :title="$t('weekend-hours')"
      >
        <b-icon-exclamation-circle-fill variant="danger" />
      </span>
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
    },
    showWeekends: {
      type: Boolean,
      default: true,
    }
  },
  emits: ["totals"],
  setup(props, {emit}) {
    // Amount of hours the employee filled in this week
    const weekTotal = computed(() => {
      return days.value.reduce((prevValue, day) => prevValue + day.hours, 0)
    });

    // Total amount of hours the employee works this week
    const expectedWeekTotal = computed(() => props.workScheme.reduce(
      (prevValue, scheme) => prevValue + scheme.theoreticalHours,
      0
    ));

    // Filtered based on if we should show the weekend
    const daysFiltered = computed(() => {
      return days.value.filter((day) => !day.day.isWeekend || props.showWeekends);
    })

    const days = computed(() => {
      return props.selectedWeek.map((day, index) => {
        let hours = 0;

        // All hours written on projects
        props.projects.forEach((project) => {
          hours += +project.values[index];
        });

        // Add the leave hours
        if (props.workScheme[index]) {
          hours += props.workScheme[index].absenceHours;
        }

        return {
          day,
          hours,
          expected: props.workScheme[index]?.theoreticalHours || 0
        } as TimesheetDayTotal;
      });
    })

    const hasWeekendHours = computed(() => {
      const saturdayHours = days.value?.at(-1)?.hours || 0;
      const sundayHours = days.value?.at(-2)?.hours || 0;

      return saturdayHours > 0 || sundayHours > 0;
    });

    watch(
      () => [weekTotal.value],
      () => {
        const totals: TimesheetTotals = {
          weekTotal: weekTotal.value,
          expectedWeekTotal: expectedWeekTotal.value,
          days: days.value,
        };

        emit('totals', totals);
      },
      {immediate: true}
    );

    return {
      days,
      daysFiltered,
      weekTotal,
      expectedWeekTotal,
      hasWeekendHours
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
  }

  .progress-bar {
    background-color: var(--color-success);
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

  .weekend-hours {
    position: absolute;
    right: 0;
    top: -8px;
    cursor: pointer;

    svg {
      border-radius: 50%;
      background-color: var(--color-light);
    }
  }
}
</style>
