<template>
  <three-col-row class="project-row">
    <template #col1>
      <div class="project-row__title font-weight-bold">
        {{ project.customer }}
      </div>
    </template>
    <template #col2>
      <div
        v-for="(input, index) in weekyHours"
        :key="index"
        :class="{
          'is-weekend': input.isWeekend,
          'is-holiday': input.isHoliday,
        }"
      >
        <div class="d-md-none mb-1">
          {{ input.date | formatDate("EEEEEE") }}
        </div>
        <b-form-input
          type="number"
          min="0"
          no-wheel
          :value="input.hours"
          class="project-row__input"
          :formatter="formatter"
          @update="update(input.date, $event)"
        />
      </div>
    </template>
    <template #col3>
      <div class="d-flex align-items-center project-row__hours-column">
        <div class="mr-2">
          <span class="d-md-none">Total uren:</span>
          {{ totalWeekHours }}
        </div>
        <b-button
          v-if="canDeleteRow"
          class="project-row__remove-button border-0"
          @click="$emit('on-remove')"
        >
          <b-icon icon="x-square" />
        </b-button>
      </div>
    </template>
  </three-col-row>
</template>

<script>
import { isSameDay } from "date-fns";

export default {
  props: {
    currentWeek: {
      type: Array,
      default: () => [],
    },
    project: {
      type: Object,
      default: () => {},
    },
    canDeleteRow: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    weekyHours() {
      return this.currentWeek.map((entry) => {
        const input = this.project.hours.find((input) =>
          isSameDay(new Date(input.date), new Date(entry.date))
        );
        return {
          ...entry,
          hours: input ? input.hours : 0,
        };
      });
    },
    totalWeekHours() {
      return this.weekyHours.reduce((acc, curr) => acc + curr.hours, 0);
    },
  },
  methods: {
    formatter(value) {
      // check for NAN and if the value is below 0. If so, set value to 0
      const roundedValue = isNaN(value) ? 0 : Math.round(value * 100) / 100;
      return Math.max(0, parseFloat(roundedValue));
    },
    update(date, hours) {
      this.$emit("on-hours-change", { date, hours });
    },
  },
};
</script>

<style scoped lang="scss">
@import "node_modules/bootstrap/scss/bootstrap";
.project-row {
  padding: 16px 0;

  + .project-row {
    border-top: 1px solid var(--color-primary);
  }

  .is-weekend .project-row__input,
  .is-holiday .project-row__input {
    background: var(--color-secondary);
  }

  &__input {
    padding: 0;
    text-align: center;
    border: 1px solid #00cccc7a;

    &:focus {
      outline: none;
    }
  }

  &__remove-button {
    display: flex;
    align-items: center;
    background: transparent;
    color: var(--color-primary);

    span {
      margin-right: 8px;
    }

    @media (min-width: 767px) {
      background: transparent;
      color: #1d1d1d;
    }
  }

  &__title {
    font-size: 17px;
    color: var(--color-primary);
  }

  &__hours-column {
    justify-content: flex-end;
    height: 100%;
  }

  @media (max-width: map-get($grid-breakpoints, md)) {
    .project-row__hours-column {
      justify-content: flex-start;
      padding-top: 16px;
      padding-bottom: 10px;
    }
  }
}
</style>
