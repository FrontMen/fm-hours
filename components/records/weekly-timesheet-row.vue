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
        :readonly="readonly"
      />
    </b-col>

    <b-col cols="1" class="weekly-timesheet-row__total-column">
      {{ totalValue }}
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api";

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
  },
  setup(props, { emit }) {
    const canRemove = computed(() => !props.readonly && props.removable);
    const handleRemoveClick = () => {
      emit("remove", props.project);
    };

    const totalValue = computed(() =>
      props.project.values.reduce((total, current) => total + current)
    );

    return {
      canRemove,
      handleRemoveClick,
      totalValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-row {
  background: #fff;
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
    border: 1px solid #85cac9;

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
