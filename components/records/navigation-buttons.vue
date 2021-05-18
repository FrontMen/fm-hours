<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container">
      <b-button-group>
        <b-button @click="handlePreviousClick()">
          <b-icon icon="arrow-left" />
        </b-button>
        <b-button
          :disabled="weekDifference === 0"
          @click="handleCurrentClick()"
        >
          <b-icon icon="calendar2-date" />
          <span class="ml-2 d-none d-sm-inline">This week</span>
        </b-button>

        <b-button :disabled="weekDifference > 3" @click="handleNextClick()">
          <b-icon icon="arrow-right" />
        </b-button>
      </b-button-group>
      <h2 class="navigation-buttons__week-label">
        {{ weekLabel }}
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api";
import differenceInCalendarWeeks from "date-fns/differenceInCalendarWeeks";

import { getWeekRange, getDateLabel, getDayOnGMT } from "~/helpers/dates";

export default defineComponent({
  emits: ["previous", "next", "current"],
  props: {
    selectedWeek: {
      type: Array as PropType<WeekDate[]>,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const handlePreviousClick = () => emit("previous");
    const handleNextClick = () => emit("next");
    const handleCurrentClick = () => emit("current");

    const weekLabel = computed(() => {
      if (!props.selectedWeek.length) return "";

      const firstDate = props.selectedWeek[0].date;
      const { start, end } = getWeekRange(firstDate);

      return getDateLabel(start, end);
    });

    const weekDifference = computed(() => {
      if (!props.selectedWeek.length) return 0;

      const today = new Date();
      const startDate = getDayOnGMT(props.selectedWeek[0].date);

      return differenceInCalendarWeeks(startDate, today, { weekStartsOn: 1 });
    });

    return {
      handlePreviousClick,
      handleNextClick,
      handleCurrentClick,
      weekLabel,
      weekDifference,
    };
  },
});
</script>

<style lang="scss">
.navigation-buttons {
  display: flex;
  justify-content: space-between;

  &__container {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  &__week-label {
    flex: 1 1 auto;
    margin: 0 0 0 8px;
    font-size: 18px;
    font-weight: bold;

    @media (min-width: 576px) {
      font-size: 24px;
    }
  }
}
</style>
