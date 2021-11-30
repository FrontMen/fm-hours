<i18n lang="yaml">
  en:
    today: "today"
  nl:
    today: "vandaag"
</i18n>

<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container">
      <b-button-group class="navigation-buttons__date-group">
        <b-button :to="localePath(prevWeekURL)">
          <b-icon icon="arrow-left" />
        </b-button>

        <b-button
          :disabled="isCurrentWeek"
          class="text-capitalize"
          :to="localePath(currWeekURL)"
        >
          {{$t('today')}}
        </b-button>

        <b-button :to="localePath(nextWeekURL)">
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
} from '@nuxtjs/composition-api';
import {addWeeks, getISOWeek, startOfISOWeek, format} from 'date-fns';
import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks';
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
      if (!props.startDate) return 0;

      const today = new Date();

      const diff = differenceInCalendarWeeks(props.startDate, today, {weekStartsOn: 1});
      return diff === 0;
    });

    return {
      weekLabel,
      isCurrentWeek,
      currWeekURL,
      prevWeekURL,
      nextWeekURL,
    };
  }
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

    @media (min-width: 560px) {
      font-size: 24px;
    }
  }
}
</style>
