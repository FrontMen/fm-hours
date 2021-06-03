<template>
  <div class="weekly-timesheet">
    <b-container fluid>
      <b-row cols="14">
        <!-- TODO: could be auto? -->
        <b-col class="weekly-timesheet__action-column" cols="4" />

        <b-col
          v-for="date in selectedWeek"
          :key="date.weekDay"
          cols="1"
          class="weekly-timesheet__date-column"
          :class="{ today: date.isToday }"
        >
          <strong class="d-block">
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
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  border-right: 1px solid var(--color-primary);
  border-bottom: 8px solid var(--color-primary);
  border-left: 1px solid var(--color-primary);
  border-radius: 8px;

  &__action-column {
    display: none;

    @media (min-width: 560px) {
      display: block;
    }
  }

  &__date-column {
    text-align: center;
    padding: 8px;
    line-height: 1.2;

    @media (max-width: 560px) {
      flex: 1;
      max-width: 100%;
    }

    &.today::after {
      content: "TODAY";
      position: absolute;
      top: -17px;
      right: 0;
      height: 17px;
      min-width: 3rem;
      left: 50%;
      transform: translateX(-50%);
      padding-top: 2px;
      font-size: 12px;
      background-color: var(--color-primary);
      color: var(--color-primary-text);
      border-radius: 4px 4px 0 0;

      @media (min-width: 560px) {
        left: 0;
        transform: none;
      }
    }
  }
}
</style>
