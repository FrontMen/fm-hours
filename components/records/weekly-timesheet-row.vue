<template>
  <b-row class="weekly-timesheet-row" cols="14">
    <b-col class="weekly-timesheet-row__action-column" cols="4">
      <span>{{ timesheetProject.project.customer.name }}</span>
    </b-col>

    <b-col
      v-for="(value, index) in weekDaysAmount"
      :key="index"
      cols="1"
      class="weekly-timesheet-row__date-column"
    >
      <b-form autpcomplete="off">
        <b-form-input
          v-model="formattedProjectValues[index]"
          class="weekly-timesheet-row__value-input"
          type="text"
          value="0"
          autocomplete="false"
          :formatter="valueFormatter && valueFormatter.formatter"
          :readonly="isReadonlyList[index]"
          @focus.native="handleInputFocus($event.target, index)"
          @input="$emit('change')"
        />
      </b-form>
      <div
        v-if="isAdmin && timesheetProject.worklogs && timesheetProject.worklogs[index]"
        class="weekly-timesheet-row__value-icon"
      >
        <b-icon
          v-b-tooltip.hover
          icon="cloud-arrow-up"
          :title="timesheetProject.worklogs[index].toString()"
        />
      </div>
    </b-col>
    <b-col cols="2" md="1" class="weekly-timesheet-row__total-column">
      {{ totalValue }}
    </b-col>
  </b-row>
</template>

<script lang="ts">
import {
  ref,
  computed,
  defineComponent,
  PropType,
  watch,
} from '@nuxtjs/composition-api';

import {checkEmployeeAvailability} from '~/helpers/employee';
import {
  floatTo24TimeString,
  floatToTotalTimeString,
  timeStringToFloat,
} from '~/helpers/timesheet';
import {recordDayStatusProps} from '~/helpers/record-status';

interface WeeklyTimesheetRowProps {
  timesheetProject: TimesheetProject,
  readonly: boolean,
  selectedWeek: WeekDate[],
  valueFormatter: Object,
  employee: Employee
  isAdmin: boolean
  showWeekends: boolean
}

export default defineComponent({
  props: {
    timesheetProject: {
      type: Object as PropType<TimesheetProject>,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    selectedWeek: {
      type: Array as PropType<WeekDate[]>,
      required: true,
    },
    valueFormatter: {
      type: Object as PropType<{ min: number; max: number; formatter(): void }>,
      default: null,
    },
    employee: {
      type: Object as PropType<Employee>,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    showWeekends: {
      type: Boolean,
      default: true,
    }
  },
  setup(props: WeeklyTimesheetRowProps) {
    const tooltip = ref();

    // Act as middleware to intercept project values to format it for the view
    const isTravelAllowance = props.timesheetProject.project.customer.name === 'Kilometers';
    const getInitialState = (project: TimesheetProject) => {
      return isTravelAllowance
        ? project.values.map((val) => val.toString())
        : project.values.map((num) => {
          if (num === 0) {
            return '0';
          } else {
            return floatTo24TimeString(num);
          }
        });
    };

    const formattedProjectValues = ref(getInitialState(props.timesheetProject));
    watch(
      formattedProjectValues,
      () => {
        // TODO: fix me
        // eslint-disable-next-line vue/no-mutating-props
        props.timesheetProject.values = formattedProjectValues.value.map((val) => {
          if (val === '') return 0;
          return !isTravelAllowance ? timeStringToFloat(val) : +val;
        });
      },
      {deep: true}
    );

    const totalValue = computed(() => {
      const total = props.timesheetProject.values.reduce(
        (total: number, current: number) => +total + +current
      );
      return isTravelAllowance ? total : floatToTotalTimeString(total);
    });

    // An array of booleans, one for each day of the selected week, that states
    // if the input for that respective day is readonly or not.
    const isReadonlyList = computed(() =>
      props.selectedWeek.map((day) => {
        if (props.readonly) {
          return true;
        }

        const isEmployeeActive = props.employee.endDate
          ? checkEmployeeAvailability(props.employee, new Date(day.date))
          : true;

        return !isEmployeeActive;
      })
    );

    const weekDaysAmount = computed(() => props.showWeekends ? 7 : 5);

    const handleInputFocus = ($input: HTMLInputElement, dayIndex: number) => {
      if (!isReadonlyList.value[dayIndex]) {
        $input.select();
      }
    };

    const shouldShowDarkBG = (day: WeekDate) =>
      recordDayStatusProps.some((prop) => day[prop]) || day.isWeekend;

    return {
      tooltip,
      totalValue,
      formattedProjectValues,
      isReadonlyList,
      weekDaysAmount,
      handleInputFocus,
      shouldShowDarkBG,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-row {
  background-color: var(--color-light);
  color: var(--body-color);
  align-items: center;
  position: relative;

  &:nth-of-type(even) {
    background-color: var(--color-medium-gray);
  }

  + .weekly-timesheet-row {
    padding-top: 12px;

    @media (max-width: 559px) {
      padding-top: 6px;
      padding-bottom: 6px;
    }

    @media (min-width: 560px) {
      padding-top: 0;
    }
  }

  &__action-column {
    @media (max-width: 560px) {
      flex: unset;
      width: 100%;
      max-width: 100%;
      padding-left: 4px;
    }

    span {
      display: inline-block;
      font-size: 18px;
      font-weight: 500;

      &::first-letter {
        text-transform: capitalize;
      }
    }
  }

  &__date-column {
    flex: 1;
    padding: 2px;
    text-align: center;
    max-width: 100%;

    @media (min-width: 768px) {
      padding: 8px;
    }
  }

  &__value-input {
    padding-left: 0;
    padding-right: 0;
    font-size: 17px;
    font-weight: 500;
    text-align: center;
    color: var(--color-dark);
    border: 1px solid var(--color-medium-gray);

    &[readonly] {
      background-color: transparent;
      border: 1px solid transparent;
      pointer-events: none;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      display: none;
    }
  }

  &__value-icon {
    position: absolute;
    right: 18px;
    top: calc(50% - 12px)
  }

  &__total-column {
    font-size: 18px;
    font-weight: 500;
    text-align: right;
    padding: 0 4px;

    @media (min-width: 560px) {
      padding: 0 15px;
    }
  }
}
</style>
