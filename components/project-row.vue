<template>
    <b-row class="hours-table__project-row project-row mb-1">
        <b-col
            class=" project-row__project-title"
            sm="12"
            md="5"
        >
            <div class="project-row__title">
                {{project.customer}}
            </div>
            <div class="project-row__description">
                {{project.project}}
            </div>
        </b-col>
        <b-col sm="12" md="5">
            <b-container fluid class="p-0">
                <b-row class="text-center">
                    <b-col
                        v-for="(input, index) in weekyHours"
                        :key="index"
                    >
                        <div class="d-md-none">{{input.date | formatDate('EEEEEE')}}</div>
                        <b-form-input
                            type="number"
                            no-wheel
                            @update="update(input.date, $event)"
                            :value="input.hours"
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
import { formatISO, isSameDay } from "date-fns";
export default {
    computed: {
        weekyHours: function () {
            return this.currentWeek.map((entry) => {
                const input = this.project.hours.find((input) => isSameDay(new Date(input.date), entry.date));
                return {
                    ...entry,
                    hours: input ? input.hours : 0
                }
            });
        },
        totalWeekHours: function () {
            return this.weekyHours.reduce((acc, curr) => acc + curr.hours, 0);
        },
    },
    props: {
        currentWeek: {
            type: Array,
            default: []
        },
        project: {
            type: Object,
            default: () => {}
        },
    },
    methods: {
        update: function(date, value) {
            const val = parseFloat(value).toFixed(2);
            // check for NAN and if the value is below 0. If so, set value to 0
            const hours = isNaN(parseFloat(value)) ? 0 : Math.max(0, parseFloat(value));

            const output = {
                project: this.project.project,
                customer: this.project.customer,
                date: formatISO(date),
                hours,
            }
            this.$emit('on-hours-change', output);
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