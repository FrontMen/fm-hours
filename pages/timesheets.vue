<template>
  <div class="page-wrapper">
    <div class="content-wrapper week-records">
      <template v-if="usersRecords && usersRecords.length > 0">
        <div
          v-for="(week, index) in usersRecords"
          :key="index"
          class="week-records__week"
          :class="{ 'is-in-future': week.isInFuture }"
        >
          <p
            class="week-records__future-label font-weight-bold pl-3"
            v-if="index === firstWeekInFuture"
          >
            Timesheets in the future:
          </p>
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
                class="mt-3"
                :rows="generateRows(records)"
                :dates="records.week"
                :value-formatter="timesheetFormatter"
                read-only
              />
              <b-button class="mt-3" @click="approveHours(records)">
                Approve hours
              </b-button>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="no-records text-center mt-5">
          The are no records for approval
        </p>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  generateValueFormatter,
  generateWeeklyValuesForTable,
} from "../helpers/records.js";

export default {
  middleware: "isAdmin",
  computed: {
    ...mapGetters({
      usersRecords: "users/getUsersRecordsForApproval",
      firstWeekInFuture: "users/getIndexOfFirstWeekInFuture",
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
      return generateWeeklyValuesForTable(records, week);
    },
  },
};
</script>

<style lang="scss" scoped>
.no-records {
  font-size: 20px;
}

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

  &__future-label {
    font-size: 34px;
  }

  &__week {
    margin-bottom: 50px;

    &.is-in-future:first-of-type {
      margin-top: 200px;
    }
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
