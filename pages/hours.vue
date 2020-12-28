<template>
  <div class="content-wrapper mt-5">
    <div class="timesheet-header mb-4">
      <div class="navigation">
        <b-button class="navigation-button" @click="goToPreviousWeek()">
          <b-icon icon="arrow-left" />
        </b-button>
        <b-button
          class="navigation-button"
          :disabled="isCurrentWeek"
          @click="goToNextWeek()"
        >
          <b-icon icon="arrow-right" />
        </b-button>
        <h2 class="selected-date">
          {{ weekLabel }}
        </h2>
      </div>
      <b-button v-if="!isCurrentWeek" @click="goToCurrentWeek()">
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
        @value-changed="updateHours"
        @remove-row="removeProject"
      >
        <template #emptyRow>
          <b-button v-b-modal.modal-add-project variant="outline-primary">
            Add project
          </b-button>
        </template>
      </weekly-values-table>
    </template>
    <template v-else>
      <div class="no-projects-card mb-5">
        <p>There are no hours registered for this week.</p>
        <b-button v-b-modal.modal-add-project> Add hours </b-button>
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
        :value-formatter="kilometerFormatter"
        @value-changed="updateKilometers"
      />
    </template>

    <div class="last-saved mt-2">
      <last-saved />
    </div>

    <b-modal
      id="modal-add-project"
      centered
      title="Add a row"
      cancel-variant="danger"
      :ok-disabled="!selectedCustomerId"
      @ok="addProject()"
      @hidden="selectedCustomerId = undefined"
    >
      <select-project
        :customers="selectableCustomers"
        @on-customer-select="selectedCustomerId = $event"
      />
    </b-modal>
  </div>
</template>

<script>
import Vue from "vue";
import { mapGetters } from "vuex";
import WeeklyValuesTable from "../components/weekly-values-table.vue";

function generateValueFormatter(min, max) {
  return {
    min,
    max,
    formatter: (value) => Math.min(Math.max(Number(value) || 0, min), max),
  };
}

export default Vue.extend({
  components: { WeeklyValuesTable },
  middleware: "isAuthenticated",
  data() {
    return {
      selectedCustomerId: undefined,
    };
  },
  computed: {
    ...mapGetters({
      customers: "customers/getCustomers",
      weekLabel: "week-dates/currentWeekLabel",
      currentWeek: "week-dates/currentWeek",
      currentWeekTravelRecords: "user/getTravelAllowanceRecordsForCurrentWeek",
      weeklyKilometers: "user/getWeeklyKilometers",
      isCurrentWeek: "week-dates/isNextweekInFuture",
      weeklyTimesheet: "user/getWeeklyTimesheet",
      lastSavedDate: "user/getLastSavedDate",
      selectableCustomers: "customers/getSelectableCustomers",
      user: "user/getUser",
    }),
    timesheetFormatter() {
      console.log("weeklyTimesheet", this.weeklyTimesheet);
      return generateValueFormatter(0, 24);
    },
    kilometerFormatter() {
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
    addProject() {
      const customer = this.customers.find(
        (customer) => customer.id === this.selectedCustomerId
      );
      const item = {
        customer: customer.name,
        debtor: customer.debtor,
        date: this.currentWeek[0].date,
        hours: 0,
      };
      this.$store.dispatch("user/addProjectRow", item);
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
      };
      this.$store.dispatch("user/addHoursRecords", newRecords);
    },
    updateKilometers({ value, date }) {
      this.$store.dispatch("user/addKilometers", { hours: value, date });
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
