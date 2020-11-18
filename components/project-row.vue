<template>
    <b-row class="hours-table__project-row project-row mb-1">
        <b-col
            class=" project-row__project-title"
            sm="12"
            md="5"
        >
            <div class="project-row__title">
                {{title}}
                <b-form-select
                    :options="customerList"
                    value="null"
                    @change="selectCustomer($event)"
                >
                </b-form-select>
                <b-form-select
                    :options="customerProjectList"
                    @change="selectProject($event)"
                    value="null"
                >
                </b-form-select>
            </div>
            <div class="project-row__description">
                {{description}}
            </div>
        </b-col>
        <b-col sm="12" md="5">
            <b-container fluid class="p-0">
                <b-row class="text-center">
                    <b-col
                        v-for="(input, index) in weekInputsArray"
                        :key="input"
                    >
                        <div class="d-md-none">{{input}}</div>
                        <b-form-input
                            type="number"
                            no-wheel
                            @update="update(input, $event, index)"
                            v-model="weekInputs[input]"
                            class="project-row__input"
                        ></b-form-input>
                    </b-col>
                </b-row>
            </b-container>
        </b-col>
        <b-col
            sm="12"
            md="2"
            class="project-row__hours-column"
        >
            <div class="project-row__total-hours">
                <span class="d-md-none">Totale uren:</span>
                {{totalWeekHours}}
            </div>
            <b-button
                class="project-row__remove-button border-0"
                @click="$emit('on-remove')"
            >
                <span class="d-md-none">Verwijderen</span>
                <b-icon icon="x-square"></b-icon>
            </b-button>
        </b-col>
    </b-row>
</template>

<script>
import { CreateSelectOptions } from '../helpers/create-select-options';
export default {
    computed: {
        weekInputsArray: function () {
            return Object.keys(this.weekInputs);
        },
        totalWeekHours: function () {
            return Object.values(this.weekInputs).reduce((x, y) => x + y , 0);
        },
        customerList: function() {
            return CreateSelectOptions(this.customers, 'Select a customer');
        },
        customerProjectList: function() {
            if (!!this.projects[this.selectedCustomerId]) {
                return CreateSelectOptions(this.projects[this.selectedCustomerId], 'Select a project')
            }
            return CreateSelectOptions([], 'Select a project');
        }
    },
    props: {
        title: String,
        description: String,
        weekInputs: {
            type: Object,
            // Object or array defaults must be returned from
            // a factory function
            default: function () {
                return {
                    mo: 0,
                    tu: 0,
                    we: 0,
                    th: 0,
                    fr: 0
                }
            }
        },
        customers: {
            type: Array,
            default: []
        },
        projects: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            selectedCustomerId: undefined,
            selectedProjectId: undefined
        }
    },
    methods: {
        update: function(inputweekInput, value, weekdayIndex) {
            // check for NAN and if the value is below 0. If zo, set value to 0
            const hours = isNaN(parseFloat(value)) ? 0 : Math.max(0, parseFloat(value));
            this.weekInputs[inputweekInput] = hours;
            const output = {
                selectedProject: this.selectedProjectId,
                selectedCustomer: this.selectedCustomerId,
                weekdayIndex,
                hours,
            }
            this.$emit('on-hours-change', output);
        },
        selectCustomer: function(customerId) {
            this.$store.dispatch('customers/getCustomersProjects', customerId);
            this.selectedCustomerId = customerId;
        },
        selectProject: function(projectId) {
            this.selectedProjectId = projectId;
        },
    }
};
</script>



<style scoped lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';
.project-row {
    padding: 12px 0 8px;
    border-bottom: 1px solid;

    &:last-child {
        border-bottom: none;
    }

    &__input {
        padding: 0;
        text-align: center;

        &:focus {
            outline: none;
        }
    }

    &__remove-button {
        display: flex;
        align-items: center;

        span {
            margin-right: 8px;
        }

        @media (min-width: 767px) {
            background: transparent;
            color: #1d1d1d;
        }
    }

    &__project-title {
         @media (max-width: map-get($grid-breakpoints, md)) {
            margin-bottom: 6px;
        }
    }

    &__title {
        font-weight: bold;
    }

    &__description {
        font-size: 12px;
    }

    &__hours-column {
        display: flex;
        align-items: center;
        justify-content: flex-end;

        @media (max-width: map-get($grid-breakpoints, md)) {
            padding-top: 16px;
            padding-bottom: 10px;
        }
    }

    &__total-hours {
        width: 50%;
        text-align: center;
    }
}
</style>
