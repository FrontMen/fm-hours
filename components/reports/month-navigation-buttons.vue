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
        :disabled="monthDifference === 0"
        @click="handleNextClick()"
      >
        <b-icon icon="arrow-right" />
      </b-button>

      <h2 class="navigation-buttons__week-label">
        {{ monthLabel }}
      </h2>
      <b-button v-if="monthDifference !== 0" @click="handleCurrentClick">
        <b-icon icon="calendar2-date" />
        <span class="ml-2 d-none d-sm-inline">To current month</span>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "@nuxtjs/composition-api";
import {differenceInCalendarMonths, format} from "date-fns";
import hotkeys from 'hotkeys-js';

export default defineComponent({
  emits: ["previous", "next", "current"],
  props: {
    selectedDate: {
      type: Date,
      required: true,
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

    const monthLabel = computed(() => {
      return format(props.selectedDate, "MMMM");
    });

    const monthDifference = computed(() => {
      const today = new Date();
      return differenceInCalendarMonths(props.selectedDate, today);
    });

    hotkeys('right', () => {
      if (monthDifference.value < 0) handleNextClick();
    });
    hotkeys('left', handlePreviousClick);

    return {
      handlePreviousClick,
      handleNextClick,
      handleCurrentClick,
      monthLabel,
      monthDifference,
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
    margin: 0 0 0 8px;
    font-size: 18px;
    font-weight: bold;

    @media (min-width: 576px) {
      font-size: 24px;
    }
  }
}
</style>
