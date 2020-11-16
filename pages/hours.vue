<template>
  <div class="page-wrapper">
    <div class="hours-table">
        <b-container fluid="lg">
            <div class="hours-table__date">
                <div class="hours-table__date-nav date-nav">

                </div>
                {{currentWeekLabel}}
                {{this.$store.state.hours.count}}
            </div>
            <b-row class="hours-table__top-row text-center">
                <b-col></b-col>
                <b-col>
                    <b-container class="p-0 d-none d-md-block">
                        <b-row class="text-center">
                            <b-col>
                                Mo
                                <div class="date">05 oct</div>
                            </b-col>
                            <b-col>
                                Tu
                                <div class="date">06 oct</div>
                            </b-col>
                            <b-col>
                                We
                                <div class="date">07 oct</div>
                            </b-col>
                            <b-col>
                                Th
                                <div class="date">08 oct</div>
                            </b-col>
                            <b-col>
                                Fr
                                <div class="date">09 oct</div>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-col>
                <b-col cols="2"></b-col>
            </b-row>
            <project-row
                v-for="project in currentWeek.projects"
                :key="project.id"
                :title="project.title"
                :description="project.description"
                :weekInputs="project.hours"
                @on-remove="removeRow(project.id)"
                @on-update="onUpdate($event)"
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
import moment from 'moment';

export default Vue.extend({
    computed: {
        currentWeekLabel: function () {
            const startDate = moment(this.currentWeek.startDate).startOf('isoWeek');
            const endDate = moment(startDate).add('4', 'days');
            let label: string = moment(startDate).format('DD');
            // check for differences between the startdate and the end date. 
            // i.e. if the end date is different than the begin date, add the month to the begin date
            if (startDate.month() !== endDate.month()) {
                label += ` ${startDate.format('MMM')}`;
                if (startDate.year() !== endDate.year()) {
                    label += ` ${startDate.format('YYYY')}`;
                }
            }
            label += ` - ${endDate.format('DD MMM YYYY')}`;
            return label;
        }
    },
    data() {
      return {
        currentWeek: {
            id: 1,
            startDate: 1605090189379,
            projects: [
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
        },
      }
    },
    methods: {
        addRow: function() {
            this.currentWeek.projects.push({
                id: + new Date(),
                title: 'Nieuw Project',
                description: 'Een beschrijving van een nieuw aangemaakt project'
            });
            this.$store.commit('hours/increment');
            this.getusers();
        },
        removeRow: function(projectId: number) {
            this.currentWeek.projects = this.currentWeek.projects.filter((p) => p.id !== projectId);
        },
        onUpdate: function(event: any) {
            console.log('Onupdate', event);
        },
        async getusers() {
            const ref = this.$fire.firestore.collection('users');
            try {
                const users = await ref.get();
                const test = users.docs.map((res) => res.data());
                console.log('usssers', test)
            } catch (e) {
                console.log('errrr', e);
            }
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
    }

    &__top-row {
        background: #ccc;
        height: 50px; 
    }
}
</style>
