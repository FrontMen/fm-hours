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
            <div class="app-table">
              <b-container class="hours-table__inner" fluid>
                <three-col-row
                  class="d-none d-md-block py-2 app-table__top-row"
                >
                  <template #col2>
                    <div
                      v-for="date in records.week"
                      :key="date.weekDay"
                      :class="{ 'is-today': date.isToday }"
                    >
                      <span class="font-weight-bold">{{ date.weekDay }}</span>
                      <div class="date">
                        {{ date.monthDay }} {{ date.month }}
                      </div>
                    </div>
                  </template>
                </three-col-row>
                <template>
                  <project-row
                    v-for="customer in transformToUIFormat(records.records)"
                    :key="customer.project"
                    :current-week="records.week"
                    :project="customer"
                    :canDeleteRow="false"
                  />
                </template>
              </b-container>
            </div>
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
import { transformRecordsToUIFormat } from "../helpers/records-transformation";

export default {
  middleware: "isAdmin",
  computed: {
    ...mapGetters({
      usersRecords: "users/getUsersRecordsForApproval",
    }),
  },
  created() {
    this.$store.dispatch("users/getUserList");
  },
  methods: {
    approveHours(records) {
      this.$store.dispatch("users/approveRecords", records);
    },
    transformToUIFormat(records) {
      return transformRecordsToUIFormat(records);
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
