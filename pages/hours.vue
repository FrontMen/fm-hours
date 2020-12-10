<template>
  <div class="page-wrapper">
      <b-container fluid class="d-md-none py-2 mobile-date-bar">
          <b-row :no-gutters="true">
              <b-col class="d-flex align-items-center">
                  <span class="d-md-none">
                    <span class="font-weight-bold mobile-week-label">{{weekLabel}}</span>
                    <last-saved class="last-saved"></last-saved>
                </span>
              </b-col>
              <b-col cols="2" class="d-flex justify-content-end">
                  <b-button class="d-md-none p-1" v-b-modal.modal-center>
                    +
                </b-button>
              </b-col>
          </b-row>
      </b-container>

      <div class="hours-table__container content-wrapper">

      <b-container class="mb-3 mx-0 px-0" fluid>
          <b-row :no-gutters="true">
              <b-col>
                <div class="hours-table__date justify-content-between">
                        <div class="d-flex align-items-center">
                            <div class="hours-table__date-nav date-nav mr-md-3">
                                <b-button @click="prevWeek()" class="mr-2 mr-md-0">
                                    <b-icon icon="arrow-left"></b-icon>
                                </b-button>
                                <b-button @click="nextWeek()" :disabled="isCurrentWeek">
                                    <b-icon icon="arrow-right"></b-icon>
                                </b-button>
                            </div>
                            <span class="d-none d-md-block font-weight-bold">
                                {{weekLabel}}
                            </span>
                        </div>
                        <div class="d-flex">
                            <b-button v-if="!isCurrentWeek" @click="toCurrentWeek()">To current week</b-button>
                            <b-button class="d-none d-md-block ml-3" v-b-modal.modal-center>
                                + New row
                            </b-button>
                        </div>
                    </div>
              </b-col>
          </b-row>
      </b-container>

    <div class="hours-table">
        <b-container class="hours-table__inner" fluid>
            <three-col-row class="d-none d-md-block py-2 hours-table__top-row">
                <template #col2 v-if="hasCustomersThisWeek">
                    <div
                        v-for="date in currentWeek"
                        :key="date.weekDay"
                        :class="{'is-today' : date.isToday}"
                    >
                        <span class="font-weight-bold">{{date.weekDay}}</span>
                        <div class="date">{{date.monthDay}} {{date.month}}</div>
                    </div>
                </template>
            </three-col-row>
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
                    <b-col>
                        <div class="d-flex flex-column d-md-block text-center py-5">
                            <p>There are no projects registered this week.</p>
                            <b-button v-b-modal.modal-center>
                                Add a project
                            </b-button>
                            <span class="mx-2">
                                or
                            </span>
                            <b-button @click="copyFromPrevWeek()">Copy from previous week</b-button>
                        </div>
                    </b-col>
                </b-row>
            </template>
            <three-col-row v-if="hasCustomersThisWeek" class="hours-table__bottom-row">
                <template #col1>
                    <last-saved class="d-none d-md-block last-saved"></last-saved>
                </template>
                <template #col2>
                    <div class="hours-table-day-total font-weight-bold"
                        v-for="(dayTotal, index) in weekTotals"
                        :key="index"
                    >{{dayTotal}}</div>
                </template>
            </three-col-row>
        </b-container>
    </div>
    </div>
    <b-modal
        id="modal-center"
        centered
        title="Add a row"
        cancel-variant="danger"
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
    middleware: 'isAuthenticated',
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
            selectableCustomers: 'customers/getSelectableCustomers',
            user: 'user/getUser',
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

.last-saved {
    font-size: 13px;
}

.week-label {
    font-size: 22px;
    color: white;
}
.date {
    font-size: 12px;
}

.is-today {
    position: relative;
    &:after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -8px;
        background: var(--color-primary);
        width: 100%;
        height: 4px;
    }
}

.mobile-week-label {
    font-size: 20px;
}

.hours-table {
    &__date {
        font-size: 24px;
        display: flex;
        margin-top: 50px;
        align-items: center;
    }

    &__inner {
        background: rgba(255, 255, 255, .8);
        border-radius: 10px;
    }

    &__top-row {
        background: var(--color-tertiary);
        border-radius: 10px 10px 0 0;
        min-height: 30px;
    }

    &__bottom-row {
        background: var(--color-tertiary);
        border-radius: 0 0 10px 10px;
        padding: 14px 0;

        .table-row .hours-table-day-total {
            text-align: center;
        }
    }
}

.mobile-date-bar {
    background: var(--color-tertiary);

    button {
        font-size: 22px;
        width: 45px;
    }
}

@media screen and (max-width: 767px) {
    .hours-table__date {
        margin-top: 20px;
    }
    .hours-table__inner {
        border-top: 30px solid var(--color-tertiary);
    }
    .page-wrapper {
        .hours-table__container {
            padding-bottom: 10px;
        }
    }
    .date-nav {
        display: flex;
        width: 100%;
        justify-content: center;
    }
    .last-saved {
        margin-top: -2px;
    }
}
</style>