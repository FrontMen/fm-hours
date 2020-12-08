<template>
  <div class="page-wrapper">
      <b-container fluid class="d-md-none py-2 mobile-date-bar">
          <b-row :no-gutters="true">
              <b-col class="d-flex align-items-center">
                  <span class="d-md-none hours-table__mobile-week-label">
                    {{weekLabel}}
                    <last-saved></last-saved>
                </span>
              </b-col>
              <b-col cols="2" class="d-flex justify-content-end">
                  <b-button class="d-md-none p-1" v-b-modal.modal-center>
                    +
                </b-button>
              </b-col>
          </b-row>
      </b-container>

    <div class="hours-table">
        <b-container class="hours-table__container" fluid="xl">
            <div class="hours-table__date">
                <div class="hours-table__date-nav date-nav mr-md-3">
                    <b-button @click="prevWeek()" class="mr-3 mr-md-0">
                        <b-icon icon="arrow-left"></b-icon>
                        <span class="d-md-none">
                            Previous week
                        </span>
                    </b-button>
                    <b-button @click="nextWeek()" :disabled="isCurrentWeek">
                        <span class="d-md-none">
                            Next week
                        </span>
                        <b-icon icon="arrow-right"></b-icon>
                    </b-button>
                </div>
                <span class="d-none d-md-block">
                    {{weekLabel}}
                </span>
                <b-button v-if="!isCurrentWeek" @click="toCurrentWeek()">To current week</b-button>
            </div>
            <b-row align-v="center" class="d-none d-md-flex hours-table__top-row">
                <b-col cols="4"></b-col>
                <b-col md="5" class="d-none d-md-block">
                    <b-container class="p-0 d-none d-md-block">
                        <b-row :no-gutters="true" class="text-center">
                            <b-col
                                v-for="date in currentWeek"
                                :key="date.weekDay"
                            >
                                {{date.weekDay}}
                                <div class="date">{{date.monthDay}} {{date.month}}</div>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-col>
                <b-col cols="2"></b-col>
            </b-row>
            <template v-if="hasCustomersThisWeek">
                <project-row
                    v-for="customer in currentWeekRecords"
                    :key="customer.project"
                    :currentWeek="currentWeek"
                    :project="customer"
                    @on-remove="removeRow(customer)"
                    @on-hours-change="changeHours($event)"
                ></project-row>
            </template>
            <template v-else>
                <b-row>
                    <b-col class="pt-5 pb-4 text-center">
                        <p>There are no projects registered this week.</p>
                        <b-button v-b-modal.modal-center>
                            Register a project
                        </b-button>
                        or
                        <b-button @click="copyFromPrevWeek()">Copy from previous week</b-button>
                    </b-col>
                </b-row>
            </template>
            <b-row v-if="hasCustomersThisWeek" class="py-3 hours-table__bottom-row">
                <b-col cols="4">
                    <div class="d-flex align-items-center">
                        <b-button class="d-none d-md-block" v-b-modal.modal-center>
                            + New row
                        </b-button>
                        <last-saved class="ml-3"></last-saved>
                    </div>
                </b-col>
                <b-col md="5" class="d-none d-md-block">
                    <b-container>
                    <b-row class="text-center">
                        <b-col
                            v-for="(dayTotal, index) in weekTotals"
                            :key="index"
                        >{{dayTotal}}</b-col>
                    </b-row>
                    </b-container>
                </b-col>
                <b-col cols="2"></b-col>
            </b-row>
        </b-container>
    </div>
    <b-modal
        id="modal-center"
        centered
        title="Add a customer"
        @ok="addRow()"
        @hidden="selectedCustomerId = undefined"
        :ok-disabled="!selectedCustomerId"
    >
        <select-project
            :customers="selectableCustomers"
            @on-customer-select="selectedCustomerId = $event"
        ></select-project>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from "vuex";
import { format, formatISO, formatDistanceToNow } from "date-fns";

export default Vue.extend({
    middleware: 'isLoggedIn',
    data() {
        return {
            selectedCustomerId: undefined
        }
    },
    computed: {
        ...mapGetters({
            customers: 'customers/getCustomers',
            weekLabel: 'week-dates/currentWeekLabel',
            currentWeek: 'week-dates/currentWeek',
            currentWeekRecords: 'user/getTimeRecordsForCurrentWeek',
            customerToAdd: 'customers/getCustomerToAdd',
            isCurrentWeek: 'week-dates/isNextweekInFuture',
            weekTotals: 'user/getWeekTotals',
            lastSavedDate: 'user/getLastSavedDate',
            selectableCustomers: 'customers/getSelectableCustomers'
        }),
        lastSavedLabel: function() {
            return formatDistanceToNow(new Date(this.lastSavedDate), { includeSeconds: true, addSuffix: true });
        },
        canAddRow: function() {
            return !!this.customerToAdd.customer;
        },
        hasCustomersThisWeek: function() {
            return this.currentWeekRecords.length > 0;
        },
    },
    created() {
      this.$store.dispatch('customers/getCustomers');
    },
    methods: {
        addRow: function() {
            const customer = this.customers.find((customer: any) => customer.id === this.selectedCustomerId);
            let item = {
                customer: customer.name,
                debtor: customer.debtor,
                date: formatISO(this.currentWeek[0].date),
                hours: 0,
            }
            this.$store.dispatch('user/addProjectRow', item);
        },
        removeRow(project: any) {
            this.$store.dispatch('user/removeRecordRow', project);
        },
        prevWeek() {
            this.$store.commit('week-dates/prevWeek');
        },
        nextWeek() {
            this.$store.commit('week-dates/nextWeek');
        },
        changeHours(record: any) {
            this.$store.dispatch('user/addHoursRecords', record);
        },
        copyFromPrevWeek(record: any) {
            this.$store.dispatch('user/copyPrevWeekrecords');
        },
        toCurrentWeek(record: any) {
            this.$store.commit('week-dates/setToday');
        },
    }
})
</script>

<style lang="scss">
.date {
    font-size: 12px;
}

.hours-table {
    &__date {
        font-size: 24px;
        padding: 18px 0px;
        display: flex;
        align-items: center;
    }

    &__top-row {
        background: var(--color-secondary);
        height: 50px;
    }

    &__bottom-row {
        background: var(--color-secondary);
    }

    &__mobile-week-label {
        font-size: 18px;

        last-saved {
            font-size: 14px;
        }
    }
}

.mobile-date-bar {
    background: var(--color-secondary);

    button {
        font-size: 22px;
        width: 45px;
    }
}

@media screen and (max-width: 767px) {
    .page-wrapper {
        height: 100vh;
        display: grid;
        grid-template-rows: 65px 1fr;

        .hours-table {
            overflow-y: scroll;
        }
    }
    .date-nav {
        display: flex;
        width: 100%;
        justify-content: center;
    }
}
</style>