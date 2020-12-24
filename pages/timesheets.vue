<template>
  <div class="page-wrapper">
    <div class="content-wrapper week-records">
      <div
        v-for="(week, index) in usersRecords"
        :key="index"
        class="week-records__week"
      >
        <div class="week-records__date font-weight-bold">
          {{ week.dateLabel }}
        </div>

        <div class="week-records__inner">
          <div
            v-for="(records, recordindex) in week.recordsForApproval"
            :key="recordindex"
            class="week-records__user"
          >
            <div class="week-records__user-name mb-2 font-weight-bold">
              {{ records.user }}
            </div>

            <weekly-values-table
              class="mt-5"
              :rows="generateRows(records)"
              :current-week="records.week"
              :value-formatter="timesheetFormatter"
            />
            <b-button class="mt-3" @click="approveHours(records)">
              Approve hours
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

function generateValueFormatter(min, max) {
  return {
    min,
    max,
    formatter: (value) => Math.min(Math.max(Number(value) || 0, min), max),
  };
}

function generateWeeklyValuesTableRows(records, week) {
  return records.map((r) => {
    return {
      customer: r.customer,
      values: week.map((day) => {
        const result = records.find((r) => r.date === day.date);
        return {
          date: day.date,
          value: result?.hours || 0,
        };
      }),
    };
  });
}

export default {
  middleware: "isAdmin",
  computed: {
    ...mapGetters({
      usersRecords: "users/getUsersRecordsForApproval",
    }),
    timesheetFormatter() {
      return generateValueFormatter(0, 24);
    },
  },
  created() {
    this.$store.dispatch("users/getUserList");
  },
  methods: {
    approveHours(records) {
      this.$store.dispatch("users/approveRecords", records);
    },
    generateRows(rowData) {
      const { records, week } = rowData;
      return generateWeeklyValuesTableRows(records, week);
    },
  },
};
</script>

<style lang="scss" scoped>
.week-records {
  margin-top: 20px;
  &__date {
    font-size: 24px;
    padding-left: 20px;
    margin-bottom: 10px;
  }

  &__inner {
    padding: 20px;
    border-radius: 20px;
    background: var(--color-secondary);
  }

  &__week {
    margin-bottom: 50px;
  }

  &__user + .week-records__user {
    margin-top: 24px;
    border-top: 1px solid var(--color-primary);
    padding-top: 20px;
  }

  &__user-name {
    font-size: 18px;
  }
}
</style>
