<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container">
      <nuxt-link v-if="!isAdminView" to="month">
        <b-button> Monthly overview </b-button>
      </nuxt-link>

      <nuxt-link
        v-if="isAdminView"
        to="/timesheets"
        class="d-flex align-items-center flex-nowrap"
      >
        <b-button>
          <b-icon class="mr-1" icon="chevron-left" aria-hidden="true" />
          Timesheets
        </b-button>
      </nuxt-link>
      <h2 class="navigation-buttons__week-label">
        {{ weekLabel }}
      </h2>
      <b-button-group class="navigation-buttons__date-group">
        <b-button @click="handlePreviousClick()">
          <b-icon icon="arrow-left" />
        </b-button>
        <b-button
          :disabled="weekDifference === 0"
          @click="handleCurrentClick()"
        >
          <b-icon icon="calendar2-date" />
        </b-button>

        <b-button :disabled="weekDifference > 3" @click="handleNextClick()">
          <b-icon icon="arrow-right" />
        </b-button>
      </b-button-group>
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
    isAdminView: {
      type: Boolean,
      default: false,
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
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    max-width: 100%;
  }

  &__date-group {
    width: 100%;

    @media (min-width: 560px) {
      width: unset;
    }
  }

  &__week-label {
    font-size: 18px;
    font-weight: bold;

    margin: 0 auto;

    @media (min-width: 560px) {
      font-size: 24px;
      margin-right: 0;
    }
  }
}
</style>
