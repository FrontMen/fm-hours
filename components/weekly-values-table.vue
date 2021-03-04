<template>
  <div :class="{ 'weekly-values-table': true, 'show-totals': showTotals }">
    <div class="table-row table-row--header">
      <div class="column d-none d-sm-block" />
      <div
        v-for="date in dates"
        :key="date.weekDay"
        :class="{ column: true, today: date.isToday }"
      >
        <strong>
          <span class="d-md-none">{{ date.weekDayShort }}</span>
          <span class="d-none d-md-inline">{{ date.weekDay }}</span>
        </strong>
        <small>
          <span>{{ date.monthDay }}</span>
          <span class="d-none d-md-inline">{{ date.month }}</span>
        </small>
      </div>
      <div class="column d-none d-sm-block" />
    </div>

    <template v-if="rows.length">
      <div
        v-for="(row, rowIndex) in rows"
        :key="row.customer"
        class="table-row table-row--values"
      >
        <div class="column">
          <template v-if="canRemoveRow && !readOnly">
            <b-button
              class="remove-button"
              variant="outline-primary"
              @click="removeRow(row)"
            >
              <b-icon icon="x-square" />
            </b-button>
          </template>
          <span>
            <strong>{{ row.customer }}</strong>
            <span class="d-sm-none">({{ totals.perRow[rowIndex] }})</span>
          </span>
        </div>

        <div
          v-for="(value, index) in row.values"
          :key="index"
          :class="{
            column: true,
            weekend: dates[index].isWeekend,
            holiday: dates[index].isHoliday,
          }"
        >
          <b-form-input
            :value="value.value"
            :formatter="valueFormatter.formatter"
            :min="valueFormatter.min"
            :max="valueFormatter.max"
            :readonly="readOnly"
            class="value-input"
            type="number"
            @update="updateValue($event, value.date, row)"
          />
        </div>

        <div class="column d-none d-sm-flex">
          {{ totals.perRow[rowIndex] }}
        </div>
      </div>
    </template>

    <template v-if="$slots.emptyRow">
      <div class="table-row table-row--values">
        <div class="column">
          <slot name="emptyRow" />
        </div>
        <div
          v-for="date in dates"
          :key="date.weekDay"
          class="d-none d-sm-flex"
          :class="{
            column: true,
            weekend: date.isWeekend,
            holiday: date.isHoliday,
          }"
        />
        <div class="column d-none d-sm-flex" />
      </div>
    </template>

    <template v-if="showTotals">
      <div class="table-row table-row--footer">
        <div class="column">
          <span>
            Total<span class="d-sm-none">: {{ totals.week }}</span>
          </span>
        </div>

        <div
          v-for="(value, index) in totals.perDay"
          :key="index"
          class="column"
        >
          <span>{{ value }}</span>
        </div>

        <div class="column d-none d-sm-flex">
          {{ totals.week }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api";

// FIXME: should by general type
interface Row {
  customer: string;
  debtor: string;
  values: { date: string; value: number }[];
}

export default defineComponent({
  emits: ["value-changed", "remove-row"],
  props: {
    rows: {
      type: Array as PropType<Row[]>,
      default: () => [],
    },
    dates: {
      type: Array,
      default: () => [],
    },
    valueFormatter: {
      type: Object,
      default: () => {},
    },
    canRemoveRow: {
      type: Boolean,
    },
    showTotals: {
      type: Boolean,
    },
    readOnly: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const totals = computed(() => {
      const days = new Array(7).fill(0);

      const rowSummaries = props.rows.map(({ values }) => ({
        rowValues: values,
        rowTotal: values.reduce((acc, { value }) => acc + value, 0),
      }));

      return {
        perRow: rowSummaries.map((summary) => summary.rowTotal),
        perDay: days.map((value, index) =>
          Number.parseInt(
            value +
              rowSummaries.map((summary) => summary.rowValues[index].value).reduce((acc, x) => acc + x)
          )
        ),
        week: rowSummaries
          .map((x) => x.rowTotal)
          .reduce((previousValue, rowTotal) => previousValue + rowTotal),
      };
    });

    const updateValue = (value: number, date: string, row: number) => {
      if (!props.readOnly) {
        emit("value-changed", { value, date, row });
      }
    };

    const removeRow = (row: number) => {
      if (!props.readOnly) {
        emit("remove-row", row);
      }
    };

    return {
      totals,
      updateValue,
      removeRow,
    };
  },
});
</script>

<style lang="scss" scoped>
/**
 * Mobile-first grid. Verify any changes on all viewports.
 */
.weekly-values-table {
  margin: 0 calc(var(--viewport-spacing-horizontal) * -1);
  font-variant-numeric: tabular-nums;
  background-color: #84cac9;

  &:not(.show-totals) {
    border-bottom: 8px solid #84cac9;
  }

  @media (min-width: 576px) {
    display: grid;
    grid-template-columns: minmax(auto, 40%) repeat(8, 1fr);
    margin: 0;
    border-radius: 8px;
  }

  .table-row {
    display: flex;
    flex-wrap: wrap;

    @media (min-width: 576px) {
      display: contents;
    }
  }

  .column {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    padding: 8px 4px;
    text-align: center;
  }

  /* Overrides for the header row */

  .table-row--header .column {
    position: relative;
    flex-direction: column;

    &.today::after {
      content: "TODAY";
      position: absolute;
      top: -17px;
      right: 0;
      left: 0;
      height: 17px;
      padding-top: 2px;
      font-size: 12px;
      background-color: #85cac9;
      border-radius: 4px 4px 0 0;
    }
  }

  /* Overrides for the value rows */

  .table-row--values .column {
    background-color: #fff;

    &.holiday,
    &.weekend {
      background-color: #e4e4e4;
    }

    &:first-child,
    &:last-child {
      padding-right: 16px;
      padding-left: 16px;
    }

    &:first-child {
      flex: 1 1 100%;
    }

    &:last-child {
      justify-content: center;
      color: #666;
    }
  }

  /* Overrides for the footer row */

  .table-row--footer .column {
    align-items: center;
    flex-direction: column;

    &:first-child,
    &:last-child {
      padding-right: 16px;
      padding-left: 16px;
      align-items: flex-start;
      font-weight: bold;
    }

    &:first-child {
      flex: 1 1 100%;
      order: 1;

      @media (min-width: 576px) {
        order: 0;
      }
    }

    &:last-child {
      justify-content: center;

      @media (min-width: 576px) {
        align-items: center;
      }
    }
  }
}

.remove-button {
  display: inline-flex;
  align-items: center;
  margin: 0 8px 0 -6px;
  padding: 0.375rem;
  border: 0;
}

.value-input {
  padding-right: 0;
  padding-left: 0;
  text-align: center;
  border: 1px solid #85cac9;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    display: none;
  }
}
</style>
