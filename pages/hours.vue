<template>
  <div class="content-wrapper mt-5">
    <div class="timesheet-header mb-4">
      <div class="navigation">
        <b-button class="navigation-button" @click="goToPreviousWeek()">
          <b-icon icon="arrow-left" />
        </b-button>
        <b-button
          class="navigation-button"
          :disabled="position.weekDifference > 3"
          @click="goToNextWeek()"
        >
          <b-icon icon="arrow-right" />
        </b-button>
        <h2 class="selected-date">
          {{ weekLabel }}
        </h2>
      </div>
      <b-button v-if="position.weekDifference !== 0" @click="goToCurrentWeek()">
        <b-icon icon="calendar2-date" />
        <span class="ml-2 d-none d-sm-inline">To current week</span>
      </b-button>
    </div>

    <template v-if="weeklyTimesheet.length">
      <weekly-values-table
        :rows="weeklyTimesheet"
        :dates="currentWeek"
        :value-formatter="timesheetFormatter"
        can-remove-row
        show-totals
        :read-only="currentWeekIsReadOnly"
        @value-changed="updateHours"
        @remove-row="removeProject"
      >
        <template
          v-if="hasSelectableCustomers && !currentWeekIsReadOnly"
          #emptyRow
        >
          <b-button v-b-modal.modal-add-project variant="outline-primary">
            Add project
          </b-button>
        </template>
      </weekly-values-table>
    </template>
    <template v-else>
      <div class="no-projects-card mb-5">
        <p>There are no hours registered for this week.</p>
        <b-button v-b-modal.modal-add-project> Add a project </b-button>
        <span class="d-none d-sm-inline mx-2"> or </span>
        <b-button @click="copyPreviousWeek()"> Copy previous week </b-button>
      </div>
    </template>

    <template v-if="user.travelAllowance">
      <h3 class="mt-5">Travel allowance</h3>
      <weekly-values-table
        class="mt-4"
        :rows="weeklyKilometers"
        :dates="currentWeek"
        :read-only="currentWeekIsReadOnly"
        :value-formatter="kilometerFormatter"
        @value-changed="updateKilometers"
      />
    </template>

    <b-button
      v-if="!currentWeekIsReadOnly"
      class="mt-3"
      @click="submitForApproval()"
    >
      Submit for approval
    </b-button>
    <template v-else>
      <p class="my-3">
        This week is submitted for approval and can not be changed
      </p>
    </template>

    <div class="last-saved mt-2">
      <last-saved />
    </div>

    <select-project-dialog
      :projects="selectableCustomers"
      @project-selected="addProject"
    />
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters } from "vuex";
import SelectProjectDialog from "../components/select-project-dialog.vue";
import WeeklyValuesTable from "../components/weekly-values-table.vue";
import { generateValueFormatter } from "../helpers/records.js";
import { recordStatus } from "../helpers/record-status.js";

export default Vue.extend({
  components: { SelectProjectDialog, WeeklyValuesTable },
  middleware: "isAuthenticated",
  computed: {
    ...mapGetters({
      customers: "customers/getCustomers",
      weekLabel: "week-dates/currentWeekLabel",
      currentWeek: "week-dates/currentWeek",
      weeklyKilometers: "user/getWeeklyKilometers",
      currentWeekIsReadOnly: "user/currentWeekIsReadOnly",
      position: "week-dates/getRelativePosition",
      weeklyTimesheet: "user/getWeeklyTimesheet",
      lastSavedDate: "user/getLastSavedDate",
      selectableCustomers: "customers/getSelectableCustomers",
      user: "user/getUser",
    }),
    hasSelectableCustomers() {
      return !!this.selectableCustomers.filter((c) => c.value && !c.disabled)
        .length;
    },
    timesheetFormatter() {
      return generateValueFormatter(0, 24);
    },
    kilometerFormatter() {
      return generateValueFormatter(0, 9999);
    },
    isSubmittedForPending() {
      return generateValueFormatter(0, 9999);
    },
  },
  created() {
    this.$store.dispatch("customers/getCustomers");
  },
  methods: {
    goToPreviousWeek() {
      this.$store.commit("week-dates/prevWeek");
    },
    goToNextWeek() {
      this.$store.commit("week-dates/nextWeek");
    },
    goToCurrentWeek() {
      this.$store.commit("week-dates/setToday");
    },
    addProject(id) {
      if (id) {
        const customer = this.customers.find((customer) => customer.id === id);
        const item = {
          customer: customer.name,
          debtor: customer.debtor,
          date: this.currentWeek[0].date,
          hours: 0,
        };
        this.$store.dispatch("user/addProjectRow", item);
      }
    },
    removeProject(project) {
      this.$store.dispatch("user/removeRecordRow", project);
    },
    copyPreviousWeek() {
      this.$store.dispatch("user/copyPrevWeekrecords");
    },
    updateHours({ value, date, row }) {
      const newRecords = {
        customer: row.customer,
        debtor: row.debtor,
        hours: value,
        date,
        status: recordStatus.NEW,
      };
      this.$store.dispatch("user/addHoursRecords", newRecords);
    },
    updateKilometers({ value, date }) {
      this.$store.dispatch("user/addKilometers", { hours: value, date });
    },
    submitForApproval() {
      this.$store.dispatch("user/submitRecordsForApproval");
    },
  },
});
</script>

<style lang="scss">
.timesheet-header {
  display: flex;
  justify-content: space-between;

  .navigation {
    flex: 0 0 auto;
    display: flex;
    align-items: center;

    .navigation-button {
      flex: 0 0 auto;
      margin-right: 8px;
    }

    .selected-date {
      flex: 1 1 auto;
      margin: 0 0 0 8px;
      font-size: 18px;
      font-weight: bold;

      @media (min-width: 576px) {
        font-size: 24px;
      }
    }
  }
}

.no-projects-card {
  padding: 40px 8px;
  text-align: center;
  background-color: #fff;
  border-top: 8px solid #85cac9;
  border-radius: 8px;

  p {
    margin-bottom: 32px;
  }

  button {
    width: 100%;
    margin-top: 16px;

    @media (min-width: 576px) {
      width: auto;
      margin-top: 0;
    }
  }
}
</style>
