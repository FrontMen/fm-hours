<template>
  <div class="content-wrapper mt-5">
    <b-container class="mx-0 px-0 mb-3" fluid>
      <b-row :no-gutters="true">
        <b-col>
          <div class="d-flex justify-content-end">
            <b-button v-b-modal.modal-center> + Add holiday </b-button>
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
        v-for="date in holidays"
        :key="date"
        class="app-table__row employee-row py-3"
      >
        <b-col cols-md="8" class="d-flex align-items-center font-weight-bold">
          {{ date | formatDate("dd MMMM yyyy") }}
        </b-col>

        <b-col cols-md="4" class="d-flex justify-content-end">
          <b-button @click="deleteHoliday(date)"> Delete </b-button>
        </b-col>
      </b-row>
    </b-container>
    <b-modal
      id="modal-center"
      centered
      title="Add a customer"
      cancel-variant="danger"
      :ok-disabled="!newHolidayValue"
      @hidden="newHolidayValue = ''"
      @ok="addHoliday()"
    >
      <b-calendar v-model="newHolidayValue" block :date-info-fn="dateClass" />
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],

  head: {
    title: "Holidays",
  },

  setup() {
    const store = useStore<RootStoreState>();
    const holidays = computed(() => store.state.holidays.holidays);

    const newHolidayValue = ref("");

    const addHoliday = () => {
      if (!newHolidayValue.value) return;

      store.dispatch("holidays/addHoliday", newHolidayValue.value);
      newHolidayValue.value = "";
    };

    const deleteHoliday = (ymd: string) => {
      store.dispatch("holidays/deleteHoliday", ymd);
    };

    const dateClass = (ymd: string) => {
      const isHoliday = holidays.value.some(
        (holidayDate) => ymd === holidayDate
      );

      return isHoliday ? "is-holiday" : "";
    };

    return {
      holidays,
      newHolidayValue,
      addHoliday,
      deleteHoliday,
      dateClass,
    };
  },
});
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
