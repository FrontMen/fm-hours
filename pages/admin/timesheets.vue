<i18n lang="yaml">
en:
  emailReminder: "Send an email reminder to everyone missing timesheets in this month"
  confirmReminder: 'Are you sure you want to remind {people}?'
  hideDone: "Hide done"
  emptyTable: "No employees to show"
  statuses: 
    empty: Empty
    new: New
    pending: Pending
    approved: Approved
    denied: Denied
nl:
  emailReminder: "Verstuur een e-mail herinnering naar iedereen met missende timesheets deze maand"
  confirmReminder: 'Are you sure you want to remind {people}?'
  hideDone: "Verberg klaar"
  emptyTable: "Geen medewerkers om te tonen"
  statuses: 
    empty: Leeg
    new: Nieuwe
    pending: In afwachting
    approved: Akkoordeer
    denied: Niet toegestaan
</i18n>

<template>
  <div class="my-5 content-wrapper">
    <b-row no-gutters class="mt-2">
      <b-col cols="3">
        <div class="actions-toolbar flex mb-3">
          <b-form-select v-model="selectedTeam" :options="teamList" class="mb-3" />

          <MonthPicker v-model="startDate" />

          <b-button v-b-tooltip.hover :title="$t('emailReminder')" @click="sendReminders">
            <b-icon icon="envelope" />
          </b-button>

          <div class="d-flex align-items-center mt-2">
            <b-form-checkbox v-model="hideDone" name="checkbox-hide-done" inline>
              {{ $t('hideDone') }}
            </b-form-checkbox>

            <b-button id="statuses" variant="link" class="statuses-button">
              <b-icon icon="question-circle" />
            </b-button>
            <b-popover target="statuses" triggers="hover" placement="right" class="d-block">
              <div v-for="status in statuses" :key="status" class="d-flex align-items-center">
                <div class="m-1 statuses--cell" :class="[status]" />
                <p class="mb-0">{{ $t(`statuses.${status}`) }}</p>
              </div>
            </b-popover>
          </div>
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
            <nuxt-link v-slot="{isActive}" :to="`/admin/timesheets/${scope.item.id}/`" custom>
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
              :title="$t(`legend.${scope.item[scope.field.key]}`)"
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
  onMounted,
  ref,
  useContext,
  useMeta,
  useStore,
  watch,
} from '@nuxtjs/composition-api';
import axios from "axios";
import {endOfMonth, getDay, setDay, startOfMonth} from 'date-fns';
import {TimesheetStatus} from '~/types/enums';
import {createReminderEmail} from '~/helpers/email';

export default defineComponent({
  setup() {
    const {i18n, app} = useContext();
    const store = useStore<RootStoreState>();
    const NO_TEAM = i18n.t('noTeam');

    useMeta(() => ({
      title: i18n.t('timesheets') as string,
    }));

    onMounted(() => {
      store.dispatch('employees/getTeamList');
    });

    const statuses = ref<string[]>(['empty', 'new', 'pending', 'approved', 'denied']);

    const startDate = ref<Date>(startOfMonth(new Date()));
    const firstMonday = computed(() =>
      setDay(startDate.value as Date, 1, {weekStartsOn: getDay(startDate.value as Date)})
    );
    const endDate = computed(() => endOfMonth(startDate.value as Date));

    const hideDone = ref<boolean>(false);
    const tableData = computed(() => ({
      fields: store.state.timesheets.timesheetTableData.fields,
      items: store.state.timesheets.timesheetTableData.items?.filter(
        item => item.billable || item.billable === undefined
      ),
    }));
    const weekDateProperties = computed(() => tableData.value?.fields.slice(1).map(x => x.key));

    const employeesWithMissingTimesheets = computed(() => {
      return tableData.value?.items?.filter(employee =>
        weekDateProperties.value.some(d => employee[d] !== TimesheetStatus.APPROVED)
      );
    });

    const selectedTeam = ref<string>('');

    const filterItemsBySearch = (
      arrayToFilter: TimesheetTableItem[],
      arrayToCompare: TimesheetTableItem[],
      selectedTeamValue: string
    ) => {
      const isSelectedTeamEqualNoTeam = selectedTeamValue === NO_TEAM;
      return arrayToFilter.filter(item => {
        if (!selectedTeamValue && !arrayToCompare.length) {
          return true;
        }

        if (arrayToCompare.length) {
          return arrayToCompare.some(employee => {
            const isEmployeeIdEqual = item.id === employee.id;

            if (!selectedTeamValue) return isEmployeeIdEqual;

            const shouldCompareToExactTeam = isSelectedTeamEqualNoTeam
              ? !item.team
              : employee.team === selectedTeamValue;

            return isEmployeeIdEqual && shouldCompareToExactTeam;
          });
        }

        if (item.team && selectedTeamValue) {
          return item.team === selectedTeamValue;
        }

        if (isSelectedTeamEqualNoTeam) {
          return !item.team;
        }

        return false;
      });
    };

    const tableDataFiltered = computed(() => {
      const {items, fields} = tableData.value;
      let filteredItems = null;

      if (!items || !fields) {
        return tableData.value;
      }

      if (hideDone.value) {
        filteredItems = filterItemsBySearch(
          items,
          employeesWithMissingTimesheets.value,
          selectedTeam.value
        );
      } else {
        filteredItems = filterItemsBySearch(items, [], selectedTeam.value);
      }

      return {
        fields,
        items: filteredItems || items,
      };
    });

    const teamList = computed(() => {
      if (!tableData.value.items) return null;
      const parsedTeam = store.getters['employees/teamList'].map((team: string) => {
        return {value: team, text: team};
      });
      return [
        {value: null, text: i18n.t('selectTeam')},
        {value: NO_TEAM, text: NO_TEAM},
        ...parsedTeam,
      ];
    });

    const sendReminders = () => {
      const names = employeesWithMissingTimesheets.value.map(e => e.name).sort();
      const mock = employeesWithMissingTimesheets.value.filter(({ name }) => name === 'Vlad Kostiuk');
      console.log(mock);
      // const confirmed = confirm(`Sending reminder to:\n${names.join(', \n')}`);
      const confirmed = confirm(`Sending reminder to:`);


      if (confirmed) {
        mock.forEach(async (employee) => {
          // const emailData = createReminderEmail({
          //   employee,
          //   startDate: startDate.value.getTime(),
          // });

          //  app.$mailService.sendMail(emailData);

          const path = `/api/mail/send/`;
          const {data} = await axios.get(path);

          console.log(data);
         });
       }
    };

    watch(
      startDate,
      () => {
        store.dispatch('timesheets/getTableData', {
          startDate: firstMonday.value,
          endDate: endDate.value,
        });
      },
      {immediate: true}
    );

    return {
      hideDone,
      tableDataFiltered,
      startDate,
      statuses,
      sendReminders,
      selectedTeam,
      teamList,
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

.statuses-button {
  box-shadow: none !important;
  &:focus {
    outline: none;
    box-shadow: none;
  }
}

.container--cell, .statuses--cell {
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

  th,
  td {
    padding: 0.3rem;
  }
}
</style>
