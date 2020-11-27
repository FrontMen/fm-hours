<template>
  <div class="page-wrapper">
    <div class="hours-table">
        <b-container fluid="lg">
            <div class="hours-table__date">
                <div class="hours-table__date-nav date-nav mr-3">
                    <b-button @click="prevWeek()">
                        <b-icon icon="arrow-left"></b-icon>
                    </b-button>
                    <b-button @click="nextWeek()" :disabled="disableNextWeek">
                        <b-icon icon="arrow-right"></b-icon>
                    </b-button>
                </div>
                {{weekLabel}}
            </div>
            <b-row class="hours-table__top-row text-center">
                <b-col></b-col>
                <b-col>
                    <b-container class="p-0 d-none d-md-block">
                        <b-row class="text-center">
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
            <project-row
                v-for="project in currentWeekRecords"
                :key="project.project"
                :currentWeek="currentWeek"
                :project="project"
                @on-remove="removeRow(project)"
                @on-hours-change="changeHours($event)"
            ></project-row>

            <b-row>
                <b-col>
                    <b-button v-b-modal.modal-center>
                        + New row
                    </b-button>
                </b-col>
                <b-col>
                    <b-container>
                    <b-row class="text-center">
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
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
        title="BootstrapVue"
        :ok-disabled="!canAddRow"
        @ok="addRow()"
        @hidden="resetCustomerToAdd"
    >
        <p class="my-4">Select a customer</p>
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
import Vue from 'vue'
import { mapGetters } from "vuex";
import { format, formatISO } from "date-fns";

export default Vue.extend({
    computed: {
        ...mapGetters({
            user: 'auth/getUser',
            customers: 'customers/getCustomers',
            projects: 'customers/getProjects',
            weekLabel: 'week-dates/currentWeekLabel',
            currentWeek: 'week-dates/currentWeek',
            timeRecords: 'user/getTimeRecords',
            currentWeekRecords: 'user/getTimeRecordsForCurrentWeek',
            selectableProjects: 'customers/getSelectableProjects',
            customerToAdd: 'customers/getCustomerToAdd',
            disableNextWeek: 'week-dates/isNextweekInFuture',
        }),
        canAddRow: function() {
            return !!(this.customerToAdd.customer && this.customerToAdd.project)
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
}
</style>