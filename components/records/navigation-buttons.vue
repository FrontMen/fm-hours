<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container">
      <b-button-group class="navigation-buttons__date-group">
        <b-button
          v-b-tooltip.hover
          title="Or use keyboard left to go to previous week"
          @click="handlePreviousClick()"
        >
          <b-icon icon="arrow-left" />
        </b-button>

        <b-button
          :disabled="weekDifference === 0"
          @click="handleCurrentClick()"
        >
          Today
        </b-button>

        <b-button
          v-b-tooltip.hover
          title="Or use keyboard right to go to next week"
          @click="handleNextClick()"
        >
          <b-icon icon="arrow-right" />
        </b-button>
      </b-button-group>
      <h2 class="navigation-buttons__week-label">
        {{ weekLabel }}
      </h2>
      <b-button-group class="navigation-buttons__date-group mr-2">
        <b-button
          class="mr-1"
          variant="info"
          href="https://bridge.hosted-tools.com/myprofile/absences"
          target="_blank"
          rel="noreferrer"
        >
          Request Leave
          <b-icon class="mr-1" icon="box-arrow-up-right" aria-hidden="true" />
        </b-button>

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
        <nuxt-link v-if="!isAdminView" to="month">
          <b-button v-b-tooltip.hover title="Go to Monthly Overview">
            Monthly Overview
          </b-button>
        </nuxt-link>
      </b-button-group>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "@nuxtjs/composition-api";
import differenceInCalendarWeeks from "date-fns/differenceInCalendarWeeks";
import hotkeys from 'hotkeys-js';

import {getWeekRange, getDateLabel, getDayOnGMT} from "~/helpers/dates";

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
  beforeDestroy() {
    hotkeys.unbind('right');
    hotkeys.unbind('left');
  },
  setup(props, {emit}) {
    const handlePreviousClick = () => emit("previous");
    const handleNextClick = () => emit("next");
    const handleCurrentClick = () => emit("current");

    const weekLabel = computed(() => {
      if (!props.selectedWeek.length) return "";

      const firstDate = props.selectedWeek[0].date;
      const {start, end} = getWeekRange(firstDate);

      return getDateLabel(start, end);
    });

    const weekDifference = computed(() => {
      if (!props.selectedWeek.length) return 0;

      const today = new Date();
      const startDate = getDayOnGMT(props.selectedWeek[0].date);

      return differenceInCalendarWeeks(startDate, today, {weekStartsOn: 1});
    });

    hotkeys('right', handleNextClick);
    hotkeys('left', handlePreviousClick);

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
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    max-width: 100%;
    align-items: stretch;
    flex-direction: row;
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
    flex-grow: 1;

    @media (min-width: 560px) {
      font-size: 24px;
    }
  }
}
</style>
