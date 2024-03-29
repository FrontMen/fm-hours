<i18n lang="yaml">
  en:
    previousHint: "Keyboard shortcut arrow left"
    nextHint: "Keyboard shortcut arrow right"
    today: "today"
  nl:
    previousHint: "Keyboard shortcut pijltje naar links"
    nextHint: "Keyboard shortcut  pijltje naar rechts"
    today: "vandaag"
</i18n>

<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container justify-content-center justify-content-md-start">
      <b-button-group class="navigation-buttons__date-group">
        <b-button
          v-b-tooltip.hover="{ variant: 'light' }"
          :title="$t('previousHint')"
          :to="localePath(prevWeekURL)"
          variant="secondary"
        >
          <b-icon icon="arrow-left" />
        </b-button>

        <b-button
          :disabled="isCurrentWeek"
          class="text-capitalize"
          :to="localePath(currWeekURL)"
          variant="secondary"
        >
          {{$t('today')}}
        </b-button>

        <b-button
          v-b-tooltip.hover="{ variant: 'light' }"
          :title="$t('nextHint')"
          :to="localePath(nextWeekURL)"
          variant="secondary"
        >
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
import {
  computed,
  defineComponent,
  useContext,
  useRouter,
  onMounted
} from '@nuxtjs/composition-api';
import {addWeeks, getISOWeek, startOfISOWeek, format, differenceInCalendarWeeks} from 'date-fns';
import hotkeys from 'hotkeys-js';
import {getDayOnGMT, addDays} from '~/helpers/dates';

export default defineComponent({
  props: {
    startDate: {
      type: Date,
      default: false
    },
    routePrefix: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const {i18n} = useContext();
    const router = useRouter();

    const start = computed(() => startOfISOWeek(getDayOnGMT(props.startDate)));
    const end = computed(() => addDays(start.value, 6));
    const weekNr = computed(() => getISOWeek(start.value));
    const currWeekURL = computed(() => props.routePrefix + format(new Date(), '/yyyy/I'));
    const prevWeekURL = computed(() => props.routePrefix + format(addWeeks(start.value, -1), '/yyyy/I'));
    const nextWeekURL = computed(() => props.routePrefix + format(addWeeks(start.value, 1), '/yyyy/I'));

    const weekLabel = computed(() => {
      if (!props.startDate) return '';

      const weekIs = i18n.t('weekNo', {num: weekNr.value});
      const formatStart = i18n.d(start.value, 'dateMonth');
      const formatEnd = i18n.d(end.value, 'dateMonthYearShort');
      return `${formatStart} - ${formatEnd} (${weekIs})`;
    });

    const isCurrentWeek = computed(() => {
      if (!props.startDate) return false;

      const today = new Date();

      const diff = differenceInCalendarWeeks(props.startDate, today, {weekStartsOn: 1});
      return diff === 0;
    });

    onMounted(() => {
      hotkeys('right', () => { router.push(nextWeekURL.value); });
      hotkeys('left', () => { router.push(prevWeekURL.value); });
    });

    return {
      weekLabel,
      isCurrentWeek,
      currWeekURL,
      prevWeekURL,
      nextWeekURL,
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
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
    max-width: 100%;
    align-items: stretch;
    flex-direction: row;
  }

  &__week-label {
    font-size: 18px;
    font-weight: bold;
    flex-grow: 1;
    text-align: center;

    @media (min-width: 560px) {
      font-size: 24px;
      text-align: left;
    }
  }
}
</style>
