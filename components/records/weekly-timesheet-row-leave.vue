<i18n lang="yaml">
en:
  title: "Leave"
  description: "Please request your leave via Bridge. After approval they will show up here."
  refresh: "Refresh the leave hours (when timesheet is not submitted)"
  publicHoliday: "Public holiday"
nl:
  title: "Verlof"
  description: "Vraag je verlof aan via Bridge. Na goedkeuring zullen ze hier verschijnen."
  refresh: "Ververs de verlofuren (als de timesheet niet ingediend is)"
  publicHoliday: "Wettelijke feestdag"
</i18n>
<template>
  <b-row class="weekly-timesheet-row" cols="14">
    <b-col class="weekly-timesheet-row__action-column" cols="4">
      <strong v-b-tooltip.hover class="title-with-tooltip" :title="$t('description')">
        {{ $t('title') }}
      </strong>

      <span v-b-tooltip.hover class="ml-4" :title="$t('refresh')">
        <b-icon
          icon="arrow-counterclockwise"
          :disabled="allowRefresh"
          @click="$emit('refresh', $event)"
        />
      </span>
    </b-col>

    <b-col
      v-for="(day) in workscheme"
      :key="day.date"
      cols="1"
      class="weekly-timesheet-row__date-column"
    >
      <span>{{ day.absenceHours }}</span>
      <span v-if="day.holiday" v-b-tooltip.hover :title="$t('publicHoliday')">
        <b-icon icon="info-circle"></b-icon>
      </span>
    </b-col>
    <b-col :cols="showWeekends ? 3 : 1" class="weekly-timesheet-row__total-column">
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
      return props.workscheme.reduce((prev: number, curr: WorkScheme) => prev + curr.absenceHours, 0);
    })

    const allowRefresh = computed(() => {
      return props.status !== (recordStatus.NEW as TimesheetStatus);
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

    @media (min-width: 560px) {
      padding-top: 0;
    }
  }

  .title-with-tooltip {
    border-bottom: dashed 1px var(--body-color);
  }

  &__action-column {
    @media (max-width: 560px) {
      flex: unset;
      width: 100%;
      max-width: 100%;
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

  &__total-column {
    text-align: right;
    padding: 0 4px;

    @media (min-width: 560px) {
      padding: 0 15px;
    }
  }
}
</style>
