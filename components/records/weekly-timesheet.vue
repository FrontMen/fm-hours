<template>
  <div class="weekly-timesheet">
    <b-container fluid>
      <b-row cols="14">
        <!-- TODO: could be auto? -->
        <b-col cols="4" />

        <b-col
          v-for="date in selectedWeek"
          :key="date.weekDay"
          cols="1"
          class="weekly-timesheet__date-column"
          :class="{ today: date.isToday }"
        >
          <strong>
            <span class="d-md-none">{{ date.weekDayShort }}</span>
            <span class="d-none d-md-block">{{ date.weekDay }}</span>
          </strong>

          <small>
            <span>{{ date.monthDay }}</span>
            <span class="d-none d-md-inline">{{ date.month }}</span>
          </small>
        </b-col>

        <b-col cols="1" />
      </b-row>

      <slot name="rows" />
    </b-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    selectedWeek: {
      type: Array as PropType<WeekDate[]>,
      default: () => [],
    },
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet {
  background-color: #84cac9;
  border-right: 1px solid #84cac9;
  border-bottom: 8px solid #84cac9;
  border-left: 1px solid #84cac9;
  border-radius: 8px;

  &__date-column {
    text-align: center;
    padding: 8px;

    &.today::after {
      content: "TODAY";
      position: absolute;
      top: -17px;
      right: 0;
      left: 0;
      height: 17px;
      padding-top: 2px;
      font-size: 12px;
      background-color: #85cac9;
      border-radius: 4px 4px 0 0;
    }
  }
}
</style>
