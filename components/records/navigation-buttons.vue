<i18n lang="yaml">
  en:
    requestLeave: "Request leave"
    monthly: "Monthly overview"
    goMonthly: "Go to Monthly Overview"
    previousHint: "Or use keyboard left to go to previous week"
    nextHint: "Or use keyboard right to go to next week"
    today: "today"
  nl:
    requestLeave: "Verlof aanvragen"
    monthly: "Maand overzicht"
    goMonthly: "Ga naar maand overzicht"
    previousHint: "Of gebruikt de pijltjestoets links om naar vorige week te navigeren"
    nextHint: "Of gebruikt de pijltjestoets rechts om naar volgende week te navigeren"
    today: "vandaag"
</i18n>

<template>
  <div class="navigation-buttons">
    <div class="navigation-buttons__container">
      <b-button-group class="navigation-buttons__date-group">
        <b-button
          v-b-tooltip.hover
          :title="$t('previousHint')"
          @click="handlePreviousClick()"
        >
          <b-icon icon="arrow-left" />
        </b-button>

        <b-button
          :disabled="weekDifference === 0"
          class="text-capitalize"
          @click="handleCurrentClick()"
        >
          {{$t('today')}}
        </b-button>

        <b-button
          v-b-tooltip.hover
          :title="$t('nextHint')"
          @click="handleNextClick()"
        >
          <b-icon icon="arrow-right" />
        </b-button>
      </b-button-group>
      <h2 class="navigation-buttons__week-label">
        {{ weekLabel }}
      </h2>
      <b-button-group class="mr-2 navigation-buttons__date-group">
        <b-button
          v-if="isIndex"
          class="mr-1"
          variant="info"
          href="https://bridge.hosted-tools.com/myprofile/absences"
          target="_blank"
          rel="noreferrer"
        >
          {{$t('requestLeave')}}
          <b-icon class="mr-1" icon="box-arrow-up-right" aria-hidden="true" />
        </b-button>

        <nuxt-link
          v-if="!isIndex"
          :to="localePath('/timesheets')"
          class="d-flex align-items-center flex-nowrap"
        >
          <b-button>
            <b-icon class="mr-1" icon="chevron-left" aria-hidden="true" />
            {{$t("timesheets")}}
          </b-button>
        </nuxt-link>

        <nuxt-link v-if="isIndex" :to="localePath('month')">
          <b-button v-b-tooltip.hover :title="$t('goMonthly')">
            {{$t("monthly")}}
          </b-button>
        </nuxt-link>
      </b-button-group>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  useContext,
  useRoute,
} from '@nuxtjs/composition-api';
import {getISOWeek} from 'date-fns';
import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks';
import hotkeys from 'hotkeys-js';
import {getWeekRange, getDayOnGMT} from '~/helpers/dates';

export default defineComponent({
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
  emits: ['previous', 'next', 'current'],
  setup(props, {emit}) {
    const {i18n} = useContext();
    const isIndex = computed(() => {
      return useRoute().value.name?.includes('index');
    });
    const handlePreviousClick = () => emit('previous');
    const handleNextClick = () => emit('next');
    const handleCurrentClick = () => emit('current');

    onBeforeMount(() => {
      hotkeys('right', handleNextClick);
      hotkeys('left', handlePreviousClick);
    });

    const weekLabel = computed(() => {
      if (!props.selectedWeek.length) return '';

      const firstDate = props.selectedWeek[0].date;
      const {start, end} = getWeekRange(firstDate);

      const weekIs = i18n.t('weekNo', {num: getISOWeek(start)});
      const formatStart = i18n.d(start, 'dateMonth');
      const formatEnd = i18n.d(end, 'dateMonthYearShort');
      return `${formatStart} - ${formatEnd} (${weekIs})`;
    });

    const weekDifference = computed(() => {
      if (!props.selectedWeek.length) return 0;

      const today = new Date();
      const startDate = getDayOnGMT(props.selectedWeek[0].date);

      return differenceInCalendarWeeks(startDate, today, {weekStartsOn: 1});
    });

    return {
      handlePreviousClick,
      handleNextClick,
      handleCurrentClick,
      isIndex,
      weekLabel,
      weekDifference,
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
