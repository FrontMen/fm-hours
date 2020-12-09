<template>
  <div class="page-wrapper">
      <div class="top-bar py-3">
      <b-container>
          <b-row>
              <b-col>
                  <div class="d-flex align-items-center">
                    <img @click="toPage('/hours')" src="@/assets/images/logo-dark.png" alt="frontmen logo">
                  </div>
              </b-col>
              <b-col>
                  <div class="d-flex align-items-center justify-content-center h-100 font-weight-bold week-label">
                    <p>{{weekLabel}}</p>
                  </div>
              </b-col>
              <b-col>
                    <div class="user d-flex align-items-center justify-content-end">
                        <!-- <div class="d-none d-md-block user__name mr-3">
                        {{user.name}}
                        </div> -->
                        <b-dropdown right class="user__dropdown">
                            <template #button-content>
                                <div class="user__image flex-shrink-0 mr-1">
                                <img :src="user.picture" alt="user image">
                                </div>
                            </template>
                        <b-dropdown-item @click="logout()">Logout</b-dropdown-item>
                        </b-dropdown>
                    </div>
              </b-col>
          </b-row>
      </b-container>
    </div>


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

      <b-container class="mb-3" fluid="xl">
          <b-row>
              <b-col>
                <div class="hours-table__date justify-content-between">
                        <div class="d-flex">
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
                        </div>
                        <b-button v-if="!isCurrentWeek" @click="toCurrentWeek()">To current week</b-button>
                    </div>
              </b-col>
          </b-row>
      </b-container>

    <div class="hours-table">
        <b-container class="hours-table__container" fluid="xl">
            <three-col-row class="d-none d-md-block hours-table__top-row">
                <template #col2 v-if="hasCustomersThisWeek">
                    <div
                        v-for="date in currentWeek"
                        :key="date.weekDay"
                    >
                        {{date.weekDay}}
                        <div class="date">{{date.monthDay}} {{date.month}}</div>
                    </div>
                </template>
            </three-col-row>
            <template v-if="hasCustomersThisWeek">
                <new-row
                    v-for="customer in currentWeekRecords"
                    :key="customer.project"
                    :currentWeek="currentWeek"
                    :project="customer"
                    @on-remove="removeRow(customer)"
                    @on-hours-change="changeHours($event)"
                ></new-row>
            </template>
            <template v-else>
                <b-row>
                    <b-col>
                        <div class="text-center py-5">
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
                    <last-saved></last-saved>
                </template>
                <template #col2>
                    <div class="hours-table-day-total"
                        v-for="(dayTotal, index) in weekTotals"
                        :key="index"
                    >{{dayTotal}}</div>
                </template>
            </three-col-row>
        </b-container>
        <b-container class="mt-3">
            <b-row>
                <b-col>
                    <b-button class="d-none d-md-block" v-b-modal.modal-center>
                        + New row
                    </b-button>
                </b-col>
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

.week-label {
    font-size: 22px;
    color: white;
}
.date {
    font-size: 12px;
}

.hours-table {
    &__date {
        font-size: 24px;
        display: flex;
        margin-top: 50px;
        align-items: center;
    }

    &__container {
        background: var(--color-secondary);
        border-radius: 10px;
    }

    &__top-row {
        background: var(--color-tertiary);
        padding: 12px 0;
        border-radius: 10px 10px 0 0;
    }

    &__bottom-row {
        background: var(--color-tertiary);
        border-radius: 0 0 10px 10px;
        padding: 14px 0;

        .table-row .hours-table-day-total {
            text-align: center;
        }
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