<template>
  <div class="timesheet">
    <div class="timesheet__row header">
      <div class="column d-none d-md-block" />
      <div
        v-for="date in currentWeek"
        :key="date.weekDay"
        :class="{ column: true, today: date.isToday }"
      >
        <div>
          <strong>{{ date.weekDay }}</strong>
        </div>
        <small>{{ date.monthDay }} {{ date.month }}</small>
      </div>
      <div class="column d-none d-md-block" />
    </div>

    <template v-if="timesheet.length">
      <div
        v-for="project in timesheet"
        :key="project.customer"
        class="timesheet__row project"
      >
        <div class="column">
          <b-button class="remove-button" @click="$emit('on-remove', project)">
            <b-icon icon="x-square" />
          </b-button>
          <strong>{{ project.customer }}</strong>
          <span class="d-md-none">
            ({{ getTotalProjectHours(project) }} hours)
          </span>
        </div>

        <div
          v-for="(input, index) in project.hours"
          :key="index"
          :class="{
            column: true,
            weekend: currentWeek[index].isWeekend,
            holiday: currentWeek[index].isHoliday,
          }"
        >
          <b-form-input
            :value="input.hours"
            :formatter="formatter"
            class="hour-input"
            type="number"
            min="0"
            max="24"
            @update="updateHours($event, input.date, project)"
          />
        </div>

        <div class="column d-none d-md-block">
          {{ getTotalProjectHours(project) }}
        </div>
      </div>
    </template>

    <div class="timesheet__row add-project">
      <div class="column">
        <b-button v-b-modal.modal-center variant="outline-primary">
          + Add project
        </b-button>
      </div>
      <div
        v-for="date in currentWeek"
        :key="date.weekDay"
        :class="{
          column: true,
          weekend: date.isWeekend,
          holiday: date.isHoliday,
        }"
      />
      <div class="column" />
    </div>

    <div class="timesheet__row footer">
      <div class="column">
        <span>Total</span>
        <span class="d-md-none">({{ totals.week }} hours)</span>
      </div>

      <div v-for="(hours, index) in totals.perDay" :key="index" class="column">
        {{ hours }}
      </div>

      <div class="column d-none d-md-block">
        {{ totals.week }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    timesheet: {
      type: Array,
      default: () => [],
    },
    totals: {
      type: Object,
      default: () => ({}),
    },
    currentWeek: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getTotalProjectHours(project) {
      return project.hours.reduce((acc, { hours }) => acc + hours, 0);
    },
    formatter(value) {
      return Math.min(Math.max(Number(value) || 0, 0), 24);
    },
    updateHours(hours, date, customer) {
      this.$emit("on-hours-change", { customer, date, hours });
    },
  },
};
</script>

<style lang="scss">
.timesheet {
  background-color: #fff;

  .timesheet__row {
    display: flex;
    flex-wrap: wrap;

    &.header .column {
      background-color: var(--color-tertiary);
    }

    &.footer .column {
      font-weight: bold;
      background-color: var(--color-tertiary);
    }

    &.project .column {
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

    &.add-project .column:not(:first-of-type) {
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

.hour-input {
  text-align: center;
  border: 1px solid #00cccc7a;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    display: none;
  }
}
</style>
