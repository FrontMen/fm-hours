<template>
  <div class="page-wrapper">
      <div class="content-wrapper mt-5">
          <b-container class="mx-0 px-0 mb-3" fluid>
            <b-row :no-gutters="true">
                <b-col>
                    <div class="d-flex justify-content-end">
                        <b-button v-b-modal.modal-center>
                            + Add holiday
                        </b-button>
                    </div>
                </b-col>
            </b-row>
        </b-container>
        <b-container fluid class="app-table">
            <b-row class="app-table__top-row py-3">
                <b-col>
                    <span class="font-weight-bold">Holidays</span>
                </b-col>
            </b-row>
            <b-row
                class="app-table__row user-row py-3"
                v-for="date in holidays"
                :key="date"
            >
                <b-col cols-md="8" class="d-flex align-items-center font-weight-bold">
                    {{date | formatDate('dd MMMM yyyy')}}
                </b-col>
                <b-col cols-md="4" class="d-flex justify-content-end">
                    <b-button @click="deleteHoliday(date)">
                        Delete
                    </b-button>
                </b-col>
            </b-row>
        </b-container>
      </div>

    <b-modal
        id="modal-center"
        centered
        title="Add a customer"
        cancel-variant="danger"
        :ok-disabled="!newHolidayValue"
        @hidden="newHolidayValue = ''"
        @ok="addHoliday()"
    >
        <b-calendar
            block
            v-model="newHolidayValue"
            :date-info-fn="dateClass"
        ></b-calendar>
    </b-modal>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from "vuex";
import { format, formatISO, isSameDay } from "date-fns";

export default Vue.extend({
    middleware: 'isAdmin',
    computed: {
        ...mapGetters({
            holidays: 'holidays/getHolidayDates',
        }),
    },
    data() {
        return {
            newHolidayValue: ''
        }
    },
    methods: {
        addHoliday: function(user) {
            this.$store.dispatch('holidays/addHoliday', formatISO(new Date(this.newHolidayValue)));
            this.newHolidayValue = ''
        },
        dateClass(_, date) {
            return this.holidays.some((holidayDate) => isSameDay(new Date(holidayDate), date)) ? 'is-holiday' : ''
        },
        deleteHoliday(date) {
            return this.$store.dispatch('holidays/deleteHoliday', formatISO(new Date(date)));
        },
    }
})
</script>

<style lang="scss">

.is-holiday {
    background: var(--color-tertiary);
    pointer-events: none;
    border-radius: 5px;

    & + .is-holiday {
        margin-left: 5px;
    }
}

</style>