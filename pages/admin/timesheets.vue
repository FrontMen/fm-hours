<i18n lang="yaml">
en:
  emailReminder: "Send an email reminder to everyone missing timesheets in this month"
  confirmReminder: 'Are you sure you want to remind {people}?'
  hideDone: "Hide done"
  emptyTable: "No employees to show"
nl:
  emailReminder: "Verstuur een e-mail herinnering naar iedereen met missende timesheets deze maand"
  confirmReminder: 'Are you sure you want to remind {people}?'
  hideDone: "Verberg klaar"
  emptyTable: "Geen medewerkers om te tonen"
</i18n>

<template>
  <div class="my-5 content-wrapper">
    <b-row no-gutters class="mt-2">
      <b-col cols="3">
        <div class="actions-toolbar flex mb-3">
          <MonthPicker v-model="startDate" />

          <b-button
            v-b-tooltip.hover
            :title="$t('emailReminder')"
            @click="sendReminders"
          >
            <b-icon icon="envelope" />
          </b-button>

          <b-form-checkbox v-model="hideDone" name="checkbox-hide-done" inline>
            {{ $t('hideDone') }}
          </b-form-checkbox>
        </div>

        <b-table
          class="timesheet-table"
          responsive
          :items="tableDataFiltered.items"
          :fields="tableDataFiltered.fields"
          sort-by="name"
        >
          <template #empty>
            <p>{{ $t('emptyTable') }}</p>
          </template>
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
  computed,
  defineComponent,
  useStore,
  useContext,
  useMeta, ref, watch,
} from "@nuxtjs/composition-api";
import {endOfMonth, getDay, setDay, startOfMonth} from "date-fns";
import {TimesheetStatus} from "~/types/enums";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();

    useMeta(() => ({
      title: i18n.t('timesheets') as string,
    }));

    const startDate = ref<Date>(startOfMonth(new Date()));
    const firstMonday = computed(() => setDay(startDate.value, 1, {weekStartsOn: getDay(startDate.value)}));
    const endDate = computed(() => endOfMonth(startDate.value as Date));

    const hideDone = ref<boolean>(false);
    const tableData = computed(() => store.state.timesheets.timesheetTableData);
    const weekDateProperties = computed(() => tableData.value?.fields.slice(1).map(x => x.key));

    const employeesWithMissingTimesheets = computed(() => {
      return tableData.value?.items?.filter((employee) => weekDateProperties.value.some((d) => employee[d] !== TimesheetStatus.APPROVED));
    });

    const tableDataFiltered = computed(() => {
      if (!hideDone.value) return tableData.value;

      return {
        fields: tableData.value.fields,
        items: tableData.value.items.filter((item) => {
          return employeesWithMissingTimesheets.value.some((employee) => employee.id === item.id);
        })
      }
    });

    const sendReminders = () => {
      const names = employeesWithMissingTimesheets.value.map(e => e.name).sort();
      const confirmed = confirm(`Sending reminder to:\n${names.join(', \n')}`);

      if (confirmed) {
        employeesWithMissingTimesheets.value.forEach((employee) => {
          store.dispatch('timesheets/emailReminder', {
            employee,
            startDate: startDate.value,
          });
        })
      }
    };

    watch(startDate, () => {
      store.dispatch("timesheets/getTableData", {
        startDate: firstMonday.value,
        endDate: endDate.value,
      });
    }, {immediate: true});

    return {
      hideDone,
      tableDataFiltered,
      startDate,
      sendReminders
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
  background-color: var(--color-primary-text);
  border: solid 2px var(--color-secondary);
  cursor: pointer;

  &.pending {
    background-color: var(--color-tertiary);
    border: solid 2px var(--color-tertiary-darker);
  }

  &.new {
    background-color: var(--color-medium-gray);
    border: solid 2px var(--color-medium-gray-darker);
  }

  &.denied {
    background-color: var(--color-danger);
    border: solid 2px var(--color-danger-darker);
  }

  &.approved {
    background-color: var(--color-success);
    border: solid 2px var(--color-success-darker);
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
