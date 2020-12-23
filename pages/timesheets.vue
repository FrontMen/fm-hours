<template>
  <div class="page-wrapper">
    <div class="content-wrapper">
      <!-- {{ usersRecords }} -->
      <div v-for="(date, index) in usersRecords" :key="index">
        {{ date.beginDate | formatDate("dd MMMM yyyy") }} -
        {{ date.endDate | formatDate("dd MMMM yyyy") }}

        <div
          v-for="(records, recordindex) in date.timeRecords"
          :key="recordindex"
        >
          {{ records.user }}
          <!-- v-for="(record, recordindex2) in records.records"
            :key="recordindex2" -->
          <div class="app-table">
            <b-container class="hours-table__inner" fluid>
              <three-col-row class="d-none d-md-block py-2 app-table__top-row">
                <template #col2>
                  <div
                    v-for="date in records.week"
                    :key="date.weekDay"
                    :class="{ 'is-today': date.isToday }"
                  >
                    <span class="font-weight-bold">{{ date.weekDay }}</span>
                    <div class="date">{{ date.monthDay }} {{ date.month }}</div>
                  </div>
                </template>
              </three-col-row>
              <template>
                <project-row
                  v-for="customer in records.records"
                  :key="customer.project"
                  :current-week="records.week"
                  :project="customer"
                  :canDeleteRow="false"
                />
              </template>
            </b-container>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

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
};
</script>

<style lang="scss" scoped></style>
