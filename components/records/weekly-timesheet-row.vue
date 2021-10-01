<i18n lang="yaml">
  en:
    remove: "Remove entries from timesheet?"
  nl:
    remove: "Wil je alle data van de urenregistratie verwijderen?"
</i18n>

<template>
  <b-row class="weekly-timesheet-row" cols="14">
    <b-col class="weekly-timesheet-row__action-column" cols="4">
      <b-button
        v-if="canRemove"
        :id="project.customer.name"
        class="weekly-timesheet-row__remove-button"
        variant="outline-primary"
      >
        <b-icon icon="x-square" />
      </b-button>

      <span>
        <strong>{{ project.customer.name }}</strong>
      </span>
    </b-col>

    <b-tooltip
      v-if="removable"
      id="tooltip-confirmation"
      ref="tooltip"
      custom-class="tooltip-opacity"
      :target="project.customer.name"
      placement="bottom"
      triggers="click blur"
      variant="light"
    >
      <div class="container">
        {{$t('remove')}}
        <b-row class="mt-2 justify-content-around">
          <b-button variant="secondary" @click="closeTooltip">
            {{$t('cancel')}}
          </b-button>
          <b-button variant="danger" @click="handleRemoveClick">
            {{$t('delete')}}
          </b-button>
        </b-row>
      </div>
    </b-tooltip>

    <b-col
      v-for="(value, index) in formattedProjectValues"
      :key="index"
      cols="1"
      class="weekly-timesheet-row__date-column"
      :class="{
        'weekly-timesheet-row__date-column--dark': shouldShowDarkBG(
          selectedWeek[index],
        ),
      }"
    >
      <b-form-input
        v-model="formattedProjectValues[index]"
        class="weekly-timesheet-row__value-input"
        type="text"
        inputmode="decimal"
        :formatter="valueFormatter && valueFormatter.formatter"
        :readonly="isReadonlyList[index]"
        @focus.native="handleInputFocus($event.target, index)"
        @input="$emit('change')"
      />
    </b-col>
    <b-col cols="1" class="weekly-timesheet-row__total-column">
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

import {checkEmployeeAvailability} from '../../helpers/employee';
import {
  floatTo24TimeString,
  floatToTotalTimeString,
  timeStringToFloat,
} from '~/helpers/timesheet';
import {recordDayStatusProps} from '~/helpers/record-status';

export default defineComponent({
  props: {
    project: {
      type: Object as PropType<TimesheetProject>,
      required: true,
    },
    removable: {
      type: Boolean,
      default: true,
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
      type: Object as PropType<{min: number; max: number; formatter(): void}>,
      default: null,
    },
    employee: {
      type: Object as PropType<Employee>,
      required: true,
    },
  },
  emits: ['remove'],
  setup(props, {emit}) {
    const tooltip = ref();
    const canRemove = computed(() => !props.readonly && props.removable);

    const closeTooltip = () => {
      tooltip.value.$emit('close');
    };

    const handleRemoveClick = () => {
      closeTooltip();
      emit('remove', props.project);
    };

    // Act as middleware to intercept project values to format it for the view
    const isTravelAllowance = props.project.customer.name === 'Kilometers';
    const getInitialState = (project: TimesheetProject) => {
      return isTravelAllowance
        ? project.values.map((val) => {
          if (props.readonly) return val.toString()
          else return ''
        })
        : project.values.map((num) => {
            if (num === 0) {
              if (props.readonly) return '0'
              else return '';
            } else {
              return floatTo24TimeString(num);
            }
          });
    };

    const formattedProjectValues = ref(getInitialState(props.project));
    watch(
      () => formattedProjectValues.value,
      () => {
        const floatIntegers = formattedProjectValues.value.map((val) => {
          if (val === '') return 0;
          return !isTravelAllowance ? timeStringToFloat(val) : +val;
        });

        // TODO: fix me
        // eslint-disable-next-line vue/no-mutating-props
        props.project.values = floatIntegers;
      }
    );

    const totalValue = computed(() => {
      const total = props.project.values.reduce(
        (total, current) => +total + +current
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

    const handleInputFocus = ($input: HTMLInputElement, dayIndex: number) => {
      if (!isReadonlyList.value[dayIndex]) {
        $input.select();
      }
    };

    const shouldShowDarkBG = (day: WeekDate) =>
      recordDayStatusProps.some((prop) => day[prop]) || day.isWeekend;

    return {
      tooltip,
      canRemove,
      closeTooltip,
      handleRemoveClick,
      totalValue,
      formattedProjectValues,
      isReadonlyList,
      handleInputFocus,
      shouldShowDarkBG,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-row {
  background: #fff;
  color: var(--body-color);
  align-items: center;

  + .weekly-timesheet-row {
    padding-top: 12px;

    @media (min-width: 560px) {
      padding-top: 0;
    }
  }

  &__remove-button {
    display: inline-flex;
    align-items: center;
    margin: 0 8px 0 -6px;
    padding: 0.375rem;
    border: 0;
  }

  &__action-column {
    @media (max-width: 560px) {
      flex: unset;
      width: 100%;
      max-width: 100%;
    }
  }

  &__date-column {
    flex: 1;
    padding: 2px;
    text-align: center;
    background-color: #fff;
    max-width: 100%;

    @media (min-width: 768px) {
      padding: 8px;
    }

    &--dark {
      background-color: #999;
    }
  }

  &__value-input {
    padding-left: 0;
    padding-right: 0;
    text-align: center;
    border: 1px solid var(--color-primary);

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      display: none;
    }
  }

  &__total-column {
    text-align: right;
    padding: 0 4px;

    @media (min-width: 560px) {
      padding: 0 15px;
    }
  }
}
.tooltip-opacity {
  opacity: 1;
}
</style>
