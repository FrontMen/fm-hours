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
    all: "#required"
    emailReminder: "#required"
    selectWeek: "#required"
    week: "#required"
    empty: "#required"
    pending: "#required"
    new: "#required"
</i18n>

<template>
  <div class="my-5 content-wrapper">
    <b-row no-gutters align-v="center">
      <b-col cols="5" sd="4" lg="3">
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
                {{$t('all')}}
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
                {{$t('selectWeek')}}
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
          {{$t('sendReminder')}}
        </b-button>
      </b-col>
    </b-row>
    <b-table
      class="mt-3 app-table timesheet-table"
      responsive
      head-variant="dark"
      :items="tableData.items"
      :fields="tableData.fields"
      :sort-compare="sortCompare"
      :sort-desc.sync="sortDescending"
      :filter="filter"
      sort-by="id"
      no-sort-reset
    >
      <template #head(id)="scope">
        <div>
          {{ scope.label }}
        </div>
      </template>
      <template #head()="scope">
        <div class="table-cell-wrapper table-cell-wrapper__heading">
          <p>
            {{
              `${scope.field.formatedStartDate} ${scope.field.formatedEndDate} (${scope.field.weekNumber})`
            }}
          </p>
        </div>
      </template>
      <template #cell(id)="scope">
        <div class="table-cell-wrapper table-cell-wrapper__employee">
          <p>{{ scope.item.name }}</p>
        </div>
      </template>
      <template #cell()="scope">
        <div
          :class="['container--cell', scope.item[scope.field.key]]"
          :title="$t(scope.item[scope.field.key])"
          @click="
            openEmployeeTimesheetPage(scope.item.id, scope.field.timestamp)
          "
        />
      </template>
    </b-table>
  </div>
</template>

<script lang="ts">
import {
  ref,
  computed,
  defineComponent,
  useRouter,
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
  middleware: ["isAdmin"],

  head: {},

  setup() {
    const { i18n, localePath } = useContext();
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
      return store.state.timesheets?.timesheetTableData?.fields?.map((field) => {
        if (!field.formatedStartDate) return null;

        const dateLabel = `${field.formatedStartDate}-${field.formatedEndDate} (${i18n.t('week')} ${field.weekNumber})`;
        return {value: field.timestamp, text: dateLabel};
      }).filter(option => option);
    });

    const router = useRouter();
    const openEmployeeTimesheetPage = (
      employeeId: string,
      startTimestamp: number
    ) => {
      router.push(localePath(`/timesheets/${employeeId}/${startTimestamp}`));
    };

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

    const sortCompare = (
      a: TimesheetTableItem,
      b: TimesheetTableItem,
      key: string
    ) => {
      if (key === "id") {
        return a?.name?.localeCompare(b?.name);
      }
    };

    return {
      options,
      selected,
      filter: getSelected,
      sortDescending,
      recordStatus,
      openEmployeeTimesheetPage,
      tableData,
      sortCompare,
      reminderOptions,
      selectedReminderStartDate,
      sendReminders,
    };
  },
});
</script>

<style lang="scss">
.filter {
  &__select {
    text-transform: capitalize;
  }
}

.container--cell {
  margin: auto;
  height: 30px;
  width: 30px;
  background-color: var(--color-medium-gray);
  cursor: pointer;
}

.container--cell.pending {
  background-color: var(--color-alert);
}

.container--cell.new {
  background-color: var(--color-success);
}

.container--cell.denied {
  background-color: var(--color-danger);
}

.container--cell.approved {
  background-color: var(--color-tertiary);
}

.table-cell-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  &__employee {
    p {
      margin: 0;
      white-space: nowrap;
    }
  }

  &__heading {
    p {
      margin: 0;
      font-size: 0.8rem;
      text-align: center;
    }
  }
}

.timesheet-table .table th {
  vertical-align: inherit;
}
</style>
