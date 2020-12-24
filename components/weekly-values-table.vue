<template>
  <div :class="{ 'values-table': true, 'has-totals': showTotals }">
    <div class="table-row header">
      <div class="column d-none d-md-block" />
      <div
        v-for="date in dates"
        :key="date.weekDay"
        :class="{ column: true, today: date.isToday }"
      >
        <div>
          <strong class="d-md-none">{{ date.weekDayShort }}</strong>
          <strong class="d-none d-md-inline">{{ date.weekDay }}</strong>
        </div>
        <small>
          <span>{{ date.monthDay }}</span>
          <span class="d-none d-md-inline">{{ date.month }}</span>
        </small>
      </div>
      <div class="column d-none d-md-block" />
    </div>

    <template v-if="rows.length">
      <div v-for="row in rows" :key="row.customer" class="table-row value-row">
        <div class="column">
          <template v-if="canRemoveRow">
            <b-button class="remove-button" @click="$emit('remove-row', row)">
              <b-icon icon="x-square" />
            </b-button>
          </template>
          <strong>{{ row.customer }}</strong>
          <span class="d-md-none">({{ totals.perRow[rowIndex] }})</span>
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
            class="value-input"
            type="number"
            :min="valueFormatter.min"
            :max="valueFormatter.max"
            @update="updateValue($event, value.date, row)"
          />
        </div>

        <div class="column d-none d-md-block">
          {{ totals.perRow[rowIndex] }}
        </div>
      </div>
    </template>

    <template v-if="$slots.emptyRow">
      <div class="table-row add-row">
        <div class="column">
          <slot name="emptyRow" />
        </div>
        <div
          v-for="date in dates"
          :key="date.weekDay"
          :class="{
            column: true,
            weekend: date.isWeekend,
            holiday: date.isHoliday,
          }"
        />
        <div class="column" />
      </div>
    </template>

    <template v-if="showTotals">
      <div class="table-row footer">
        <div class="column">
          <span>Total</span>
          <span class="d-md-none">({{ totals.week }})</span>
        </div>

        <div
          v-for="(value, index) in totals.perDay"
          :key="index"
          class="column"
        >
          {{ value }}
        </div>

        <div class="column d-none d-md-block">
          {{ totals.week }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
const totalsTemplate = {
  perRow: [],
  perDay: new Array(7).fill(0),
  week: 0,
};

function calculateTotals(rows) {
  return rows
    .map(({ values }) => ({
      rowValues: values,
      rowTotal: values.reduce((acc, { value }) => acc + value, 0),
    }))
    .reduce((acc, { rowValues, rowTotal }) => {
      return {
        perRow: [...acc.perRow, rowTotal],
        perDay: acc.perDay.map((value, i) => value + rowValues[i].value),
        week: acc.week + rowTotal,
      };
    }, totalsTemplate);
}

export default {
  props: {
    rows: {
      type: Array,
      default: () => [],
    },
    /** The dates of the week the rows are related to */
    dates: {
      type: Array,
      default: () => [],
    },
    canRemoveRow: {
      type: Boolean,
      default: false,
    },
    /** Whether to show totals at the bottom of the table */
    showTotals: {
      type: Boolean,
      default: false,
    },
    valueFormatter: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      totals: totalsTemplate,
    };
  },
  watch: {
    rows(rows) {
      this.totals = calculateTotals(rows);
    },
  },
  methods: {
    updateValue(value, date, row) {
      this.$emit("value-changed", { value, date, row });
    },
  },
};
</script>

<style lang="scss" scoped>
.values-table {
  background-color: #fff;

  &:not(.has-totals) {
    border-bottom: 8px solid var(--color-tertiary);
  }

  .table-row {
    display: flex;
    flex-wrap: wrap;

    &.header .column {
      background-color: var(--color-tertiary);
    }

    &.footer .column {
      font-weight: bold;
      background-color: var(--color-tertiary);
    }

    &.value-row .column {
      padding: 12px 4px;

      &:first-child,
      &:last-child {
        padding-top: 20px;
        padding-bottom: 8px;

        @media (min-width: 768px) {
          padding-bottom: 20px;
        }
      }
    }

    &.add-row .column:not(:first-of-type) {
      display: none;

      @media (min-width: 768px) {
        display: block;
        padding: 12px 4px;
      }
    }

    .column {
      position: relative;
      flex: 1 1 0;
      padding: 8px 4px;
      text-align: center;

      &:first-child {
        flex: 1 1 100%;
        padding-left: 8px;
        text-align: left;
      }

      &:last-child {
        padding-right: 16px;
        text-align: left;

        @media (min-width: 768px) {
          text-align: right;
          min-width: 64px;
        }
      }

      &.holiday,
      &.weekend {
        background-color: #ddd;
      }

      &.today::after {
        content: "";
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 4px;
        background-color: var(--color-primary);
      }
    }

    @media (min-width: 768px) {
      display: contents;
    }
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: auto repeat(8, max-content);
  }
}

.remove-button {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem;
  color: var(--color-primary);
  background-color: transparent;
  border: 0;
}

.value-input {
  text-align: center;
  border: 1px solid #00cccc7a;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    display: none;
  }

  @media (min-width: 768px) {
    width: 56px;
  }
}
</style>
