<template>
  <div class="content-wrapper mt-5">
    <div class="timesheet-header">
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
        <span class="selected-date">{{ weekLabel }}</span>
      </div>
      <b-button v-if="!isCurrentWeek" @click="goToCurrentWeek()">
        <b-icon icon="calendar2-date" />
        <span class="ml-2 d-none d-sm-inline">To current week</span>
      </b-button>
    </div>

    <template v-if="weeklyTimesheet.length">
      <weekly-timesheet
        :timesheet="weeklyTimesheet"
        :totals="weeklyTotals"
        :current-week="currentWeek"
        @on-hours-change="updateHours"
        @on-remove="removeProject"
      />
      <div class="last-saved">
        <last-saved />
      </div>
    </template>

    <template v-else>
      <div class="no-projects-card">
        <p>There are no hours registered for this week.</p>
        <b-button v-b-modal.modal-center> Add hours </b-button>
        <span class="d-none d-sm-inline mx-2"> or </span>
        <b-button @click="copyPreviousWeek()"> Copy previous week </b-button>
      </div>
    </template>

    <div v-if="user.travelAllowance" class="travel-allowance-registering mt-5">
      <div class="travel-allowance-registering__title mb-2 font-weight-bold">
        Travel allowance
      </div>
      <div class="app-table">
        <b-container class="hours-table__inner" fluid>
          <three-col-row class="d-none d-md-block py-2 app-table__top-row">
            <template #col2>
              <div
                v-for="date in currentWeek"
                :key="date.weekDay"
                :class="{ 'is-today': date.isToday }"
              >
                <span class="font-weight-bold">{{ date.weekDay }}</span>
                <div class="date">{{ date.monthDay }} {{ date.month }}</div>
              </div>
            </template>
          </three-col-row>
          <project-row
            v-if="user.travelAllowance"
            :project="currentWeekTravelRecords"
            :can-delete-row="false"
            :current-week="currentWeek"
            @on-hours-change="registerKilometers($event)"
          />
          <three-col-row class="app-table__bottom-row" />
        </b-container>
      </div>
    </div>

    <b-modal
      id="modal-center"
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
import WeeklyTimesheet from "../components/weekly-timesheet.vue";

export default Vue.extend({
  components: { WeeklyTimesheet },
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
      isCurrentWeek: "week-dates/isNextweekInFuture",
      weeklyTimesheet: "user/getWeeklyTimesheet",
      weeklyTotals: "user/getWeeklyTotals",
      lastSavedDate: "user/getLastSavedDate",
      selectableCustomers: "customers/getSelectableCustomers",
      user: "user/getUser",
    }),
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
    updateHours(registerData) {
      const { hours, date, customer } = registerData;
      const newRecords = {
        customer: customer.customer,
        debtor: customer.debtor,
        date,
        hours,
      };
      this.$store.dispatch("user/addHoursRecords", newRecords);
    },
    copyPreviousWeek() {
      this.$store.dispatch("user/copyPrevWeekrecords");
    },
    registerKilometers(registerData) {
      const { hours, date } = registerData;
      this.$store.dispatch("user/addKilometers", { hours, date });
    },
  },
});
</script>

<style lang="scss">
.date {
  font-size: 12px;
}

.is-today {
  position: relative;
  &:after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -8px;
    background: var(--color-primary);
    width: 100%;
    height: 4px;
  }
}

.travel-allowance-registering {
  &__title {
    font-size: 24px;
  }
}

@media screen and (max-width: 767px) {
  .hours-table__inner {
    border-top: 30px solid var(--color-tertiary);
    border-radius: 10px;
  }
}

.timesheet-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;

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
      margin-left: 8px;
      font-size: 18px;
      font-weight: bold;

      @media (min-width: 768px) {
        font-size: 24px;
      }
    }
  }
}

.no-projects-card {
  padding: 40px 8px;
  text-align: center;
  background-color: #fff;
  border-top: 8px solid var(--color-tertiary);

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

.last-saved {
  margin: 8px 0;
  min-height: 1.5em;
}
</style>
