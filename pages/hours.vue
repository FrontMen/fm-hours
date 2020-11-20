<template>
  <div class="page-wrapper">
    <div class="hours-table">
        <b-container fluid="lg">
            <div class="hours-table__date">
                <div class="hours-table__date-nav date-nav mr-3">
                    <b-button @click="prevWeek()">
                        <b-icon icon="arrow-left"></b-icon>
                    </b-button>
                    <b-button @click="nextWeek()">
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
                v-for="project in projectsRows"
                :key="project.id"
                :title="project.title"
                :description="project.description"
                :weekInputs="project.hours"
                :customers="customers"
                :projects="projects"
                @on-remove="removeRow(project.id)"
                @on-hours-change="changeHours($event)"
            ></project-row>

            <b-row>
                <b-col>
                    <b-button @click="addRow()">
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from "vuex";
import { format } from "date-fns";
import { debounce } from '../helpers/debounce';

export default Vue.extend({
    computed: {
        ...mapGetters({
            user: 'auth/getUser',
            customers: 'customers/getCustomersArray',
            customersEntities: 'customers/getCustomersEntities',
            projects: 'customers/getProjects',
            weekLabel: 'week-dates/currentWeekLabel',
            currentWeek: 'week-dates/currentWeek'
        }),
    },
    created() {
      this.$store.dispatch('customers/getCustomers');
    },
    data() {
      return {
          hoursDebouncer: debounce(function (fn: any) {
            fn();
        }, 2000),
        projectsRows: [
            {
                id: 1,
                title: 'Rabobank',
                description: 'Afdeling hypotheken',
                hours: {
                    mo: 1,
                    tu: 2,
                    we: 3,
                    th: 4,
                    fr: 5
                }
            },
            {
                id: 2,
                title: 'Rabobank',
                description: 'Afdeling verzekeringen',
                hours: {
                    mo: 5,
                    tu: 2,
                    we: 10,
                    th: 4,
                    fr: 5
                }
            },
            {
                id: 3,
                title: 'Postcode loterij',
                description: 'Algemeen'
            },
        ]
      }
    },
    methods: {
        addRow: function() {
            this.projectsRows.push({
                id: + new Date(),
                title: 'Nieuw Project',
                description: 'Een beschrijving van een nieuw aangemaakt project',
            });
        },
        removeRow: function(projectId: number) {
           this.projectsRows = this.projectsRows.filter((p) => p.id !== projectId);
        },
        prevWeek: function() {
            this.$store.commit('week-dates/prevWeek');
        },
        nextWeek: function() {
            this.$store.commit('week-dates/nextWeek');
        },
        changeHours: function(ev: any) {
            this.hoursDebouncer(() => {
                const timeRecord = {
                    hours: ev.hours,
                    customer: this.customersEntities[ev.selectedCustomer].name,
                    project: this.projects[ev.selectedCustomer].find((project: any) => project.id === ev.selectedProject).name,
                    date: format(this.currentWeek[ev.weekdayIndex].date, 'dd/MM/yyyy'),
                };
                this.$store.dispatch('user/addHoursRecords', timeRecord);
            });
        }
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
