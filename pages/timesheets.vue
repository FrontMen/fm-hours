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
            v-if="index === firstWeekInFuture"
            class="week-records__future-label font-weight-bold"
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
                show-totals
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

<script lang="ts">
import { computed, defineComponent, useStore } from "@nuxtjs/composition-api";
import { generateWeeklyValuesForTable } from "~/helpers/records";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    // FIXME: would be nice it can access stores directly
    const store = useStore<RootStoreState>();
    store.dispatch("users/getUserList");

    const userRecords = computed(() =>
      store.getters.users.getUsersRecordsForApproval()
    );

    const firstWeekInfutre = computed(() =>
      store.getters.users.getIndexOfFirstWeekInFuture()
    );

    // FIXME: use typing for `records`
    const approveHours = (records: any) => {
      store.dispatch("users/approveRecords", records);
    };

    // FIXME: use typing for `rowData`
    const generateRows = (rowData: any) => {
      const { records, week } = rowData;
      return generateWeeklyValuesForTable(records, week);
    };

    return {
      userRecords,
      firstWeekInfutre,
      approveHours,
      generateRows,
    };
  },
});
</script>

<style lang="scss" scoped>
.no-records {
  font-size: 20px;
}

.week-records {
  margin-top: 20px;

  &__date {
    font-size: 24px;
    margin-bottom: 10px;
  }

  &__inner {
    margin: 0 calc(var(--viewport-spacing-horizontal) * -1);
    padding: 16px var(--viewport-spacing-horizontal);
    background: #c1e4e3;

    @media (min-width: 576px) {
      margin: 0;
      padding: 24px;
      border-radius: 20px;
    }
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
