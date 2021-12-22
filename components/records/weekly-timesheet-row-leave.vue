<i18n lang="yaml">
en:
  leave: "Leave"
nl:
  leave: "Verlof"
</i18n>
<template>
  <b-row class="weekly-timesheet-row" cols="14">
    <b-col class="weekly-timesheet-row__action-column" cols="4">
      <span>
        <strong>{{ $t('leave') }}</strong>
      </span>
    </b-col>

    <b-col
      v-for="(value, index) in leaveDays"
      :key="index"
      cols="1"
      class="weekly-timesheet-row__date-column"
    >
      {{ value }}
    </b-col>
    <b-col
      v-if="leaveDays.length > 0"
      cols="3"
      class="weekly-timesheet-row__total-column"
    >
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

export default defineComponent({
  props: {
    workscheme: {
      type: Array as PropType<WorkScheme[]>,
      required: true,
    },
  },
  setup(props: { workscheme: WorkScheme[]; }) {
    const leaveDays = computed(() => {
      return props.workscheme.map((day) => {
        return day.absenceHours
      })
    });

    const totalValue = computed(() => {
      return props.workscheme.reduce((prev: number, curr: WorkScheme) => prev + curr.absenceHours, 0);
    })

    return {
      totalValue,
      leaveDays
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
