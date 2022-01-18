<i18n lang="yaml">
en:
  all: "All"
  emailReminder: "Email reminder:"
  selectWeek: "Select week"
  week: "Week"
  empty: "empty"
  pending: "pending"
  new: "new"
nl:
  all: "Alles"
  emailReminder: "Email herinnering:"
  selectWeek: "Selecteer week"
  week: "Week"
  empty: "leeg"
  pending: "in afwachting"
  new: "Nieuw"
</i18n>

<template>
  <div class="my-5 content-wrapper">
    <b-row no-gutters align-v="center">
      <b-col cols="5" sd="4" lg="3" class="mr-4">
        <b-form-group
          :label="$t('filterBy') + ':'"
          label-for="filter-select"
          label-class="font-weight-bold"
          class="filter"
        >
          <b-form-select
            id="filter-select"
            v-model="selected"
            :options="options"
            class="filter__select"
          >
            <template #first>
              <b-form-select-option :value="null">
                {{ $t('all') }}
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="7" sd="4" lg="3" class="mr-2">
        <b-form-group
          :label="$t('emailReminder')"
          label-for="select-reminder-week"
          label-class="font-weight-bold"
          class="filter"
        >
          <b-form-select
            id="select-reminder-week"
            v-model="selectedReminderStartDate"
            :options="reminderOptions"
            class="filter__select"
          >
            <template #first>
              <b-form-select-option :value="undefined">
                {{ $t('selectWeek') }}
              </b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col class="mt-auto mb-3">
        <b-button
          variant="warning"
          :disabled="!selectedReminderStartDate"
          @click="sendReminders"
        >
          {{ $t('sendReminder') }}
        </b-button>
      </b-col>
    </b-row>

    <b-row no-gutters class="mt-2">
      <b-col cols="3">
        <b-table
          class="timesheet-table"
          responsive
          :items="tableData.items"
          :fields="tableData.fields"
          :filter="filter"
          sort-by="id"
        >
          <template #head(id)>&nbsp;</template>
          <template #head()="scope">
            <p
              class="table-cell-wrapper table-cell-wrapper__heading text-center"
              :class="{ 'table-cell-wrapper__heading--current': scope.field.isThisWeek }"
              :title="`${$d(new Date(scope.field.timestamp), 'dateMonth')} - ${$d(new Date(scope.field.timestampEnd), 'dateMonth')}`"
            >
              {{ scope.field.weekNumber }}
            </p>
          </template>
          <template #cell(id)="scope">
            <nuxt-link
              v-slot="{isActive}"
              :to="`/admin/timesheets/${scope.item.id}/`"
              custom
            >
              <p
                class="table-cell-wrapper table-cell-wrapper__employee"
                :class="{ 'table-cell-wrapper__employee--active': isActive }"
              >
                {{ scope.item.name }}
              </p>
            </nuxt-link>
          </template>
          <template #cell()="scope">
            <nuxt-link
              :class="['container--cell', scope.item[scope.field.key]]"
              :title="$t(scope.item[scope.field.key])"
              :to="`/admin/timesheets/${scope.item.id}/${scope.field.year}/${scope.field.weekNumber}`"
            />
          </template>
        </b-table>
      </b-col>
      <b-col cols="9">
        <NuxtChild />
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import {
  ref,
  computed,
  defineComponent,
  useStore,
  useContext,
  useMeta,
} from "@nuxtjs/composition-api";
import {
  format,
} from 'date-fns';

import {recordStatus} from "~/helpers/record-status";
import {TimesheetStatus} from "~/types/enums";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();

    useMeta(() => ({
      title: i18n.t('timesheets') as string,
    }));

    const options = Object.entries(TimesheetStatus)
      .map(([value, text]) => ({
        value,
        text,
      }))
      .sort((a, b) => a.text.localeCompare(b.text));

    const sortDescending = ref<boolean>(
      store.getters["filters/getTimesheetSortDescending"]
    );
    const selected = ref(store.getters["filters/getTimesheetFilterBy"]);
    const selectedReminderStartDate = ref<number>();
    const getSelected = computed(() => selected.value);

    const weeksBefore = 6;
    const weeksAfter = 2;

    const tableData = computed(() => {
      handleFilterUpdates();
      return store.state.timesheets.timesheetTableData;
    });
    store.dispatch("timesheets/getTableData", {
      weeksBefore,
      weeksAfter,
    });

    const reminderOptions = computed(() => {
      return store.state.timesheets?.timesheetTableData?.fields?.map((field: TimesheetTableField) => {
        if (!field.timestamp || !field.timestampEnd) return null;

        const dateLabel = `${i18n.d(new Date(field.timestamp as number), "dateMonth")} - ${i18n.d(new Date(field.timestampEnd as number), "dateMonth")} (${i18n.t('weekNo', {num: field.weekNumber})})`;
        return {value: field.timestamp, text: dateLabel};
      }).filter(option => option);
    });

    const handleFilterUpdates = () => {
      if (store.getters["filters/getTimesheetFilterBy"] !== selected.value) {
        store.dispatch("filters/updateTimesheetFilterBy", selected.value);
      }
      if (
        store.getters["filters/getTimesheetSortDescending"] !==
        sortDescending.value
      ) {
        store.dispatch(
          "filters/updateTimesheetSortDescending",
          sortDescending.value
        );
      }
    };

    const sendReminders = () => {
      if (!selectedReminderStartDate.value) return;
      const formattedData = format(new Date(selectedReminderStartDate.value), "yyyy-MM-dd");

      tableData.value?.items?.forEach((employee) => {
        if (!employee.email || !(employee[formattedData] === TimesheetStatus.EMPTY || employee[formattedData] === TimesheetStatus.DENIED)) return;
        store.dispatch('timesheets/emailReminder', {
          employee: {
            name: employee.name,
            email: employee.email,
          },
          startDate: selectedReminderStartDate.value,
        });
      });
    };

    return {
      options,
      selected,
      filter: getSelected,
      sortDescending,
      recordStatus,
      tableData,
      reminderOptions,
      selectedReminderStartDate,
      sendReminders,
    };
  },

  head: {},
});
</script>

<style lang="scss">
.filter {
  &__select {
    text-transform: capitalize;
  }
}

.container--cell {
  display: block;
  margin: auto;
  height: 16px;
  width: 16px;
  background-color: var(--color-medium-gray);
  border: solid 2px var(--color-medium-gray-darker);
  cursor: pointer;

  &.pending {
    background-color: var(--color-alert);
    border: solid 2px var(--color-alert-darker);
  }

  &.new {
    background-color: var(--color-success);
    border: solid 2px var(--color-success-darker);
  }

  &.denied {
    background-color: var(--color-danger);
    border: solid 2px var(--color-danger-darker);
  }

  &.approved {
    background-color: var(--color-tertiary);
    border: solid 2px var(--color-tertiary-darker);
  }
}


.table-cell-wrapper {
  display: flex;
  align-items: center;

  &__employee {
    justify-content: flex-start;
    margin: 0;
    font-size: 0.8rem;
    font-weight: normal;
    white-space: nowrap;

    &--active {
      font-weight: bold;
    }
  }

  &__heading {
    margin: 0;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: normal;

    &--current {
      font-weight: bold;

      &::before {
        content: '';
        position: absolute;
        width: 25px;
        height: 25px;
        border: solid 1px var(--color-primary);
        border-radius: 100%;
      }
    }
  }
}

.timesheet-table .table th {
  vertical-align: inherit;
}

.timesheet-table {
  background: var(--color-primary-text);
  border-radius: 10px;

  th, td {
    padding: 0.3rem;
  }
}
</style>
