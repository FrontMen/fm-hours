<i18n lang="yaml">
en:
  previousHint: "Keyboard shortcut arrow left"
  nextHint: "Keyboard shortcut arrow right"
  currentHint: "To current {DATE_MSG}"

nl:
  previousHint: "Keyboard shortcut pijltje naar links"
  nextHint: "Keyboard shortcut  pijltje naar rechts"
  currentHint: "Huidige {DATE_MSG}"
</i18n>

<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container">
      <b-button
        v-b-tooltip.hover="{ variant: 'light' }"
        class="navigation-buttons__button"
        :title="$t('previousHint', {DATE_MSG})"
        @click="handlePreviousClick()"
      >
        <b-icon icon="arrow-left" />
      </b-button>

      <b-button
        v-b-tooltip.hover="{ variant: 'light' }"
        class="navigation-buttons__button"
        :title="$t('currentHint', {DATE_MSG})"
        @click="handleCurrentClick"
      >
        <b-icon icon="calendar2-date" />
      </b-button>

      <b-button
        v-b-tooltip.hover="{ variant: 'light' }"
        class="navigation-buttons__button"
        :title="$t('nextHint', {DATE_MSG})"
        @click="handleNextClick()"
      >
        <b-icon icon="arrow-right" />
      </b-button>

      <h2 class="navigation-buttons__week-label--reports text-capitalize">
        {{ YEAR_OR_MONTH_MSG }}
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onBeforeMount, useContext} from '@nuxtjs/composition-api';
import {differenceInCalendarMonths} from 'date-fns';
import hotkeys from 'hotkeys-js';

export default defineComponent({
  props: {
    selectedDate: {
      type: Date,
      required: true,
    },
    isYearly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['previous', 'next', 'current'],
  setup(props, {emit}) {
    const {i18n} = useContext();

    const DATE_MSG = computed(() => {
      const MSG = props.isYearly ? i18n.t('year') : i18n.t('month');
      return `${MSG}`.toLowerCase();
    });

    const YEAR_OR_MONTH_MSG = computed(() => {
      return props.isYearly ? props.selectedDate.getFullYear() : i18n.d(props.selectedDate, 'monthYear');
    });

    const handlePreviousClick = () => emit('previous');
    const handleNextClick = () => emit('next');
    const handleCurrentClick = () => {
      if (monthDifference.value !== 0) emit('current');
    };

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
      DATE_MSG,
      YEAR_OR_MONTH_MSG,
    };
  },
  beforeDestroy() {
    hotkeys.unbind('right');
    hotkeys.unbind('left');
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
