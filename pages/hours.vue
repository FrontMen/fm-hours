<template>
  <div class="page-wrapper">
      <b-container fluid class="d-md-none py-2 mobile-date-bar">
          <b-row :no-gutters="true">
              <b-col class="d-flex align-items-center">
                  <span class="d-md-none hours-table__mobile-week-label">
                    {{weekLabel}}
                    <div class="last-saved" v-if="lastSavedDate">
                        Last saved on {{lastSavedDate | formatDate('HH:mm:ss')}}
                    </div>
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
        <b-container class="hours-table__container" fluid="md">
            <div class="hours-table__date">
                <div class="hours-table__date-nav date-nav mr-md-3">
                    <b-button @click="prevWeek()" class="mr-3 mr-md-0">
                        <b-icon icon="arrow-left"></b-icon>
                        <span class="d-md-none">
                            Previous week
                        </span>
                    </b-button>
                    <b-button @click="nextWeek()" :disabled="disableNextWeek">
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
            <b-row align-v="center" class="d-none d-md-flex hours-table__top-row">
                <b-col cols="5"></b-col>
                <b-col class="d-none d-md-block">
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
                    v-for="project in currentWeekRecords"
                    :key="project.project"
                    :currentWeek="currentWeek"
                    :project="project"
                    @on-remove="removeRow(project)"
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
                    </b-col>
                </b-row>
            </template>
            <b-row v-if="hasCustomersThisWeek" class="py-3 hours-table__bottom-row">
                <b-col>
                    <div class="d-flex align-items-center">
                        <b-button class="d-none d-md-block" v-b-modal.modal-center>
                            + New row
                        </b-button>
                        <span class="ml-3" v-if="lastSavedDate">
                            Last saved on {{lastSavedDate | formatDate('HH:mm:ss')}}
                        </span>
                    </div>
                </b-col>
                <b-col class="d-none d-md-block">
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
        :ok-disabled="!canAddRow"
        @ok="addRow()"
        @hidden="resetCustomerToAdd"
    >
        <select-project
            :customers="customers"
            :projects="selectableProjects"
            @on-customer-select="getProjectForCustomer($event)"
            @on-project-select="selectProject($event)"
        ></select-project>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from "vuex";
import { format, formatISO } from "date-fns";

export default Vue.extend({
    computed: {
        ...mapGetters({
            customers: 'customers/getCustomers',
            projects: 'customers/getProjects',
            weekLabel: 'week-dates/currentWeekLabel',
            currentWeek: 'week-dates/currentWeek',
            timeRecords: 'user/getTimeRecords',
            currentWeekRecords: 'user/getTimeRecordsForCurrentWeek',
            selectableProjects: 'customers/getSelectableProjects',
            customerToAdd: 'customers/getCustomerToAdd',
            disableNextWeek: 'week-dates/isNextweekInFuture',
            weekTotals: 'user/getWeekTotals',
            lastSavedDate: 'user/getLastSavedDate'
        }),
        canAddRow: function() {
            return !!(this.customerToAdd.customer && this.customerToAdd.project)
        },
        hasCustomersThisWeek: function() {
            return this.currentWeekRecords.length > 0;
        }
    },
    created() {
      this.$store.dispatch('customers/getCustomers');
    },
    methods: {
        addRow: function() {
            const customer = this.customers.find((customer: any) => customer.id === this.customerToAdd.customer);
            const project = this.projects[this.customerToAdd.customer].find((customer: any) => customer.id === this.customerToAdd.project);
            let item = {
                customer: customer.name,
                date: formatISO(this.currentWeek[0].date),
                hours: 0,
                project: project.name
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
        getProjectForCustomer(customerId: number) {
            this.$store.dispatch('customers/selectCustomerToAdd', customerId);
        },
        selectProject(projectId: number) {
            this.$store.commit('customers/selectCustomerToAddProject', projectId);
        },
        resetCustomerToAdd(projectId: number) {
            this.$store.commit('customers/resetCustomerToAdd');
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
        background: #ccc;
        height: 50px;
    }

    &__bottom-row {
        background: #ccc;
    }

    &__mobile-week-label {
        font-size: 18px;

        .last-saved {
            font-size: 14px;
        }
    }
}

.mobile-date-bar {
    background: #ccc;

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