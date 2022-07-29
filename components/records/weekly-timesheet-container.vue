<i18n lang="yaml">
en:
  TODAY: "today"
  TDY: "tdy"
  T: "t"
  HOLIDAY: "holiday"
  HOLI: "holi"
  H: "h"
  LEAVE: "leave"
  LVD: "lvd"
  L: "l"
  PART-TIME: "part-time"
  PTD: "ptd"
  P: "p"
nl:
  TODAY: "vandaag"
  TDY: "vdg"
  T: "V"
  HOLIDAY: "Vakantie"
  HOLI: "Vak"
  H: "Vk"
  LEAVE: "Verlof"
  LVD: "Vlf"
  L: "Vf"
  PART-TIME: "Deeltijd"
  PTD: "Dt"
  P: "Dt"
</i18n>
<template>
  <div class="weekly-timesheet" :class="{ 'weekly-timesheet--no-header': !showHeader }">
    <b-container>
      <b-row v-if="showHeader" cols="14">
        <b-col class="weekly-timesheet__action-column" cols="4" />

        <b-col
          v-for="date in selectedWeek"
          :key="date.weekDay"
          cols="1"
          class="weekly-timesheet__date-column"
          :class="{
            'weekly-timesheet__date-column--full': !showWeekends,
          }"
        >
          <span v-if="shouldShowCaption(date)" class="caption text-uppercase">
            {{ $t(getCaptionText(date)) }}
          </span>

          <small class="d-block text-capitalize">
            <span class="d-md-none">
              {{ $d(new Date(date.date), 'dayNarrow') }}
            </span>
            <span class="text-uppercase d-none d-md-block">
              {{ $d(new Date(date.date), 'dayShort') }}
            </span>
          </small>

          <strong>
            <span class="h4 d-none d-md-inline">
              {{ $d(new Date(date.date), 'date') }}
            </span>
            <span class="d-md-none">{{ $d(new Date(date.date), 'date') }}</span>
          </strong>
        </b-col>

        <b-col cols="1" />
      </b-row>

      <slot name="rows" />
    </b-container>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from '@nuxtjs/composition-api'

import {recordDayStatus, recordDayStatusProps} from '~/helpers/record-status'

export default defineComponent({
  props: {
    selectedWeek: {
      type: Array as PropType<WeekDate[]>,
      default: () => [],
    },
    showHeader: {
      type: Boolean,
      default: true,
    },
    showWeekends: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const captionSizes = ['LONG', 'MID', 'SHORT']

    const shouldShowCaption = (day: WeekDate) =>
      recordDayStatusProps.some(prop => day[prop])

    const getCaptionText = (day: WeekDate) => {
      const dayStatusScore =
        recordDayStatusProps.reduce((acc, index) => acc + +day[index], 0) - 1

      const captionSizeIndex = dayStatusScore > 2 ? 2 : dayStatusScore
      const captionSize = captionSizes[
        captionSizeIndex
        ] as keyof typeof recordDayStatus[0]

      const captionText = recordDayStatusProps.reduce((acc, prop) => {
        if (day[prop]) {
          acc +=
            recordDayStatus.find(status => status.prop === prop)![captionSize] +
            '/'
        }

        return acc
      }, '')

      return captionText.replace(/\/$/g, '')
    }

    return {
      shouldShowCaption,
      getCaptionText,
    }
  },
})
</script>

<style lang="scss" scoped>
.weekly-timesheet {
  background-color: var(--color-light);
  color: var(--body-color);
  border: 1px solid var(--color-light-gray);
  border-radius: 4px;

  &--no-header {
    border-top: 8px solid var(--color-primary);
  }

  &__action-column {
    display: none;

    @media (min-width: 560px) {
      display: block;
    }
  }

  &__date-column {
    text-align: center;
    padding: 8px;
    line-height: 1.2;

    &--full {
      flex: 1;
      max-width: 100%;
    }

    .caption {
      position: absolute;
      top: -17px;
      right: 0;
      height: 17px;
      min-width: 3rem;
      left: 50%;
      transform: translateX(-50%);
      padding-top: 2px;
      font-size: 12px;
      background-color: var(--color-primary);
      color: var(--color-primary-text);
      border-radius: 4px 4px 0 0;

      @media (min-width: 560px) {
        left: 0;
        transform: none;
      }
    }
  }
}
</style>
