<template>
  <b-row class="weekly-timesheet-row" cols="14">
    <b-col cols="4">
      <b-button
        v-if="canRemove"
        class="weekly-timesheet-row__remove-button"
        variant="outline-primary"
        @click="handleRemoveClick"
      >
        <b-icon icon="x-square" />
      </b-button>

      <span>
        <strong>{{ project.customer.name }}</strong>
      </span>
    </b-col>

    <b-col
      v-for="(value, index) in project.values"
      :key="index"
      cols="1"
      class="weekly-timesheet-row__date-column"
      :class="{
        weekend: selectedWeek[index].isWeekend,
        holiday: selectedWeek[index].isHoliday,
      }"
    >
      <b-form-input
        v-model="project.values[index]"
        class="weekly-timesheet-row__value-input"
        type="number"
        :formatter="valueFormatter.formatter"
        :min="valueFormatter.min"
        :max="valueFormatter.max"
        :readonly="checkIfReadonly(selectedWeek[index].date)"
        @focus.native="
          handleInputFocus($event.target, selectedWeek[index].date)
        "
        @input="$emit('change')"
      />
    </b-col>

    <b-col cols="1" class="weekly-timesheet-row__total-column">
      {{ totalValue }}
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api";

import { checkEmployeeAvailability } from "../../helpers/employee";

export default defineComponent({
  emits: ["remove"],
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
      type: Object as PropType<{ min: number; max: number; formatter(): void }>,
    },
    employee: {
      type: Object as PropType<Employee>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const canRemove = computed(() => !props.readonly && props.removable);
    const handleRemoveClick = () => {
      emit("remove", props.project);
    };

    const totalValue = computed(() =>
      props.project.values.reduce((total, current) => total + current)
    );

    const checkIfReadonly = (paramDate: string) => {
      if (props.readonly) {
        return true;
      }

      const isEmployeeActive = props.employee.endDate
        ? checkEmployeeAvailability(props.employee, new Date(paramDate))
        : false;

      return !isEmployeeActive;
    };

    const handleInputFocus = ($input: HTMLInputElement, paramDate: string) => {
      if (!checkIfReadonly(paramDate)) {
        $input.select();
      }
    };

    return {
      canRemove,
      handleRemoveClick,
      totalValue,
      checkIfReadonly,
      handleInputFocus,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-row {
  background: #fff;
  color: var(--body-color);
  align-items: center;

  &__remove-button {
    display: inline-flex;
    align-items: center;
    margin: 0 8px 0 -6px;
    padding: 0.375rem;
    border: 0;
  }

  &__date-column {
    padding: 8px;
    text-align: center;
    background-color: #fff;

    &.holiday,
    &.weekend {
      background-color: #e4e4e4;
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
  }
}
</style>
