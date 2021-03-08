<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container">
      <b-button
        class="navigation-buttons__button"
        @click="handlePreviousClick()"
      >
        <b-icon icon="arrow-left" />
      </b-button>

      <b-button
        class="navigation-buttons__button"
        :disabled="weekDifference > 3"
        @click="handleNextClick()"
      >
        <b-icon icon="arrow-right" />
      </b-button>

      <h2 class="navigation-buttons__week-label">
        {{ weekLabel }}
      </h2>
    </div>

    <b-button v-if="weekDifference !== 0" @click="handleCurrentClick()">
      <b-icon icon="calendar2-date" />
      <span class="ml-2 d-none d-sm-inline">To current week</span>
    </b-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api";
import differenceInCalendarWeeks from "date-fns/differenceInCalendarWeeks";

import { getWeekRange, getDateLabel } from "~/helpers/dates";

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
      if (!props.selectedWeek.length) return ''

      const firstDate = props.selectedWeek[0].date;
      const { start, end } = getWeekRange(firstDate);

      return getDateLabel(start, end);
    });

    const weekDifference = computed(() => {
      if (!props.selectedWeek.length) return 0

      const today = new Date();
      const startDate = new Date(props.selectedWeek[0].date);

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

  &__button {
    flex: 0 0 auto;
    margin-right: 8px;
  }

  &__week-label {
    flex: 1 1 auto;
    margin: 0 0 0 8px; // TODO: use margin class instead
    font-size: 18px;
    font-weight: bold;

    @media (min-width: 576px) {
      font-size: 24px;
    }
  }
}
</style>
