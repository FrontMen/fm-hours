<i18n lang="yaml">
en:
  title: "Absence"
  short_description: "Leave and public holiday's"
  description: "Please request your leave via Bridge. After approval they will show up here."
  refresh: "Refresh the leave hours"
  publicHoliday: "Public holiday"
nl:
  title: "Afwezigheid"
  short_description: "Verlof en feestdagen"
  description: "Vraag je verlof aan via Bridge. Na goedkeuring zullen ze hier verschijnen."
  refresh: "Ververs de verlofuren"
  publicHoliday: "Wettelijke feestdag"
</i18n>
<template>
  <b-row class="weekly-timesheet-row" cols="14">
    <b-col class="weekly-timesheet-row__action-column" cols="4">
      <div class="d-flex flex-row">
        <div class="d-flex flex-column">
          <strong
            v-b-tooltip.hover="{ variant: 'light' }"
            class="flex-shrink-1"
            :title="$tc('description')"
          >
            {{ $t('title') }}
          </strong>
          <span>{{ $t('short_description') }}</span>
        </div>

        <span
          v-if="allowRefresh"
          v-b-tooltip.hover="{ variant: 'light' }"
          class="ml-4"
          :title="$tc('refresh')"
        >
          <b-icon icon="arrow-counterclockwise" @click="$emit('refresh', $event)" />
        </span>
      </div>
    </b-col>

    <b-col
      v-for="(day) in workscheme"
      :key="day.date"
      cols="1"
      class="weekly-timesheet-row__date-column"
    >
      <b-form-input
        class="weekly-timesheet-row__value-input"
        type="text"
        disabled
        :placeholder="day.absenceHours.toString()"
      />
      <span
        v-if="day.holiday"
        v-b-tooltip.hover
        :title="$tc('publicHoliday')"
        class="holiday-tooltip"
      >
        <b-icon icon="info-circle"></b-icon>
      </span>
    </b-col>

    <template v-if="showWeekends">
      <b-col cols="1" class="weekly-timesheet-row__date-column">
        <b-form-input
          class="weekly-timesheet-row__value-input"
          type="text"
          disabled
          placeholder="0"
        />
      </b-col>
      <b-col cols="1" class="weekly-timesheet-row__date-column">
        <b-form-input
          class="weekly-timesheet-row__value-input"
          type="text"
          disabled
          placeholder="0"
        />
      </b-col>
    </template>

    <b-col cols="1" class="weekly-timesheet-row__total-column">
      {{ totalValue }}
    </b-col>
  </b-row>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
} from '@nuxtjs/composition-api';
import {recordStatus} from "~/helpers/record-status";
import {hoursToHHmm} from "~/helpers/timesheet";

export default defineComponent({
  props: {
    workscheme: {
      type: Array as PropType<WorkScheme[]>,
      required: true,
    },
    status: {
      type: String as PropType<TimesheetStatus>,
      required: true,
    },
    showWeekends: {
      type: Boolean,
      default: true,
    }
  },
  emits: ['refresh'],
  setup(props: { workscheme: WorkScheme[], status: TimesheetStatus }) {
    const totalValue = computed(() => {
      const total = props.workscheme.reduce((prev: number, curr: WorkScheme) => prev + curr.absenceHours, 0);
      return hoursToHHmm(total)
    })

    const allowRefresh = computed(() => {
      return props.status === (recordStatus.NEW as TimesheetStatus);
    })

    return {
      totalValue,
      allowRefresh,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-row {
  background: #fff;
  color: var(--body-color);
  align-items: center;

  + .weekly-timesheet-row {
    padding-top: 12px;

    @media (max-width: 559px) {
      padding-top: 6px;
      padding-bottom: 6px;
    }

    @media (min-width: 560px) {
      padding-top: 0;
    }
  }

  &__action-column {
    @media (max-width: 560px) {
      flex: unset;
      width: 100%;
      max-width: 100%;
      padding-left: 4px;
    }
  }

  &__date-column {
    flex: 1;
    padding: 2px;
    text-align: center;
    background-color: #fff;
    max-width: 100%;

    @media (min-width: 768px) {
      padding: 8px;
    }
  }

  &__value-input {
    padding-left: 0;
    padding-right: 0;
    font-size: 17px;
    font-weight: 500;
    text-align: center;
    color: var(--color-dark);
    border: 1px solid var(--color-medium-gray);

    &[readonly] {
      background-color: transparent;
      border: 1px solid transparent;
      pointer-events: none;
    }

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      display: none;
    }
  }

  .holiday-tooltip {
    position: absolute;
    top: 15px;
    right: 20px;
  }

  &__total-column {
    font-size: 18px;
    font-weight: 500;
    text-align: right;
    padding: 0 4px;

    @media (min-width: 560px) {
      padding: 0 15px;
    }
  }
}
</style>
