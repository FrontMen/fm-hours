<i18n lang="yaml">
  en:
    previousHint: "Or use keyboard left to go to previous month"
    nextHint: "Or use keyboard right to go to next month"
    currentHint: "To current month"
  nl:
    previousHint: "#required"
    nextHint: "#required"
    currentHint: "#required"
</i18n>

<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container">
      <b-button
        v-b-tooltip.hover
        class="navigation-buttons__button"
        :title="$t('previousHint')"
        @click="handlePreviousClick()"
      >
        <b-icon icon="arrow-left" />
      </b-button>

      <b-button
        v-b-tooltip.hover
        class="navigation-buttons__button"
        :title="$t('currentHint')"
        @click="handleCurrentClick"
      >
        <b-icon icon="calendar2-date" />
      </b-button>

      <b-button
        v-b-tooltip.hover
        class="navigation-buttons__button"
        :title="$t('nextHint')"
        @click="handleNextClick()"
      >
        <b-icon icon="arrow-right" />
      </b-button>

      <h2 class="navigation-buttons__week-label--reports text-capitalize">
        {{$d(selectedDate, 'monthYear')}}
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onBeforeMount} from "@nuxtjs/composition-api";
import {differenceInCalendarMonths} from "date-fns";
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
    const handleCurrentClick = () => {
      if (monthDifference.value !== 0) emit("current");
    }
    const monthDifference = computed(() => {
      const today = new Date();
      return differenceInCalendarMonths(props.selectedDate, today);
    });

    onBeforeMount(() => {
      hotkeys('right', handleNextClick);
      hotkeys('left', handlePreviousClick);
    });

    return {
      handlePreviousClick,
      handleNextClick,
      handleCurrentClick,
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

  &__week-label--reports {
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
