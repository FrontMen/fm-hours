<i18n lang="yaml">
  en:
    notActive: "Not active for employee"
  nl:
    notActive: "#required"
</i18n>
<template>
  <div>
    <h3
      v-if="title"
      class="mt-5 mb-3 d-inline-block"
      :class="{ 'inactive-section text-danger': !active }"
      :title="$t(notActive)"
    >
      {{ title }}
      <b-icon-exclamation-triangle v-if="!active" variant="danger" />
    </h3>
    <div class="weekly-timesheet" :class="{ 'inactive-section': !active }">
      <b-container fluid>
        <b-row cols="14">
          <b-col class="weekly-timesheet__action-column" cols="4" />

          <b-col
            v-for="date in selectedWeek"
            :key="date.weekDay"
            cols="1"
            class="weekly-timesheet__date-column"
          >
            <span v-if="shouldShowCaption(date)" class="caption">
              {{ getCaptionText(date) }}
            </span>
            <strong class="d-block">
              <span class="d-md-none">{{ date.weekDayShort }}</span>
              <span class="d-none d-md-block">{{ date.weekDay }}</span>
            </strong>

            <small>
              <span>{{ date.monthDay }}</span>
              <span class="d-none d-md-inline">{{ date.month }}</span>
            </small>
          </b-col>

          <b-col cols="1" />
        </b-row>

        <slot name="rows" />
      </b-container>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

import { recordDayStatus, recordDayStatusProps } from '~/helpers/record-status'

export default defineComponent({
  props: {
    title: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    selectedWeek: {
      type: Array as PropType<WeekDate[]>,
      default: () => [],
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
.inactive-section {
  opacity: 0.5;
}
.weekly-timesheet {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  border-right: 1px solid var(--color-primary);
  border-bottom: 8px solid var(--color-primary);
  border-left: 1px solid var(--color-primary);
  border-radius: 8px;

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

    @media (max-width: 560px) {
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
