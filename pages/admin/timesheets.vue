<i18n lang="yaml">
en:
  hideDone: "Hide done"
  emptyTable: "No employees to show"
  status: Statuses
  statuses:
    empty: Empty
    new: New
    pending: Pending
    approved: Approved
    denied: Denied
  teamFilter: "Filter on team"
nl:
  hideDone: "Verberg klaar"
  emptyTable: "Geen medewerkers om te tonen"
  status: Statussen
  statuses:
    empty: Leeg
    new: Nieuwe
    pending: In afwachting
    approved: Goedgekeurd
    denied: Niet toegestaan
  teamFilter: "Filter op team"
</i18n>

<template>
  <admin-container>
    <b-row no-gutters class="mt-2">
      <b-col cols="3">
        <b-card class="actions-toolbar flex mb-3">
          <div class="mb-2">
            <strong>{{ $t('teamFilter')}}:</strong>
          </div>
          <team-selector v-model="selectedTeamId" :allow-none="true" class="mb-3"></team-selector>

          <month-picker v-model="startDate" class="col-12 px-0"></month-picker>

          <div class="d-flex align-items-center justify-content-between mt-2">
            <b-form-checkbox v-model="hideDone" name="checkbox-hide-done" inline switch>
              {{ $t('hideDone') }}
            </b-form-checkbox>

            <b-button id="statuses" variant="link" class="statuses-button">
              <b-icon icon="info-circle" />
            </b-button>
            <b-popover target="statuses" triggers="hover" placement="right" class="d-block">
              <template #title>{{ $t('status') }}</template>
              <div v-for="status in statuses" :key="status" class="d-flex align-items-center">
                <div class="m-1 statuses--cell" :class="[status]" />
                <p class="mb-0">{{ $t(`statuses.${status}`) }}</p>
              </div>
            </b-popover>
          </div>
        </b-card>

        <b-card no-body>
          <b-table
            class="timesheet-table mb-0"
            responsive
            striped
            borderless
            :items="tableDataFiltered.items"
            :fields="tableDataFiltered.fields"
            :sticky-header="true"
            :no-border-collapse="true"
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
                :title="$t(`statuses.${scope.item[scope.field.key]}`)"
                :to="`/admin/timesheets/${scope.item.id}/${scope.field.year}/${scope.field.weekNumber}`"
              />
            </template>
          </b-table>
        </b-card>
      </b-col>
      <b-col cols="9">
        <NuxtChild />
      </b-col>
    </b-row>
  </admin-container>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useContext,
  useMeta,
  useStore,
  watch,
} from '@nuxtjs/composition-api';
import {endOfMonth, getDay, setDay, startOfMonth} from 'date-fns';

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();
    const NO_TEAM = 'none';

    const selectedTeamId = ref<string>();

    useMeta(() => ({
      title: i18n.t('timesheets') as string,
    }));

    const statuses = ref<string[]>(['empty', 'new', 'pending', 'approved', 'denied']);

    const startDate = ref<Date>(startOfMonth(new Date()));
    const firstMonday = computed(() =>
      setDay(startDate.value as Date, 1, {weekStartsOn: getDay(startDate.value as Date)})
    );
    const endDate = computed(() => endOfMonth(startDate.value as Date));

    const hideDone = ref<boolean>(false);
    const tableData = computed(() => ({
      fields: store.state.timesheets.timesheetTableData.fields,
      items: store.state.timesheets.timesheetTableData.items,
    }));
    const weekDateProperties = computed(() => tableData.value?.fields.slice(1).map(x => x.key));

    const employeesWithMissingTimesheets = computed(() => {
      return tableData.value?.items?.filter(employee =>
        weekDateProperties.value.some(d => employee[d] !== TimesheetStatus.APPROVED)
      );
    });

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
          selectedTeamId.value || ''
        );
      } else {
        filteredItems = filterItemsBySearch(items, [], selectedTeamId.value || '');
      }

      return {
        fields,
        items: filteredItems || items,
      };
    });

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
      selectedTeamId,
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
    background-color: var(--color-tertiary-light);
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
      color: var(--color-light);

      &::before {
        content: '';
        position: absolute;
        width: 25px;
        height: 25px;
        background: var(--color-primary);
        border-radius: 100%;
        z-index: -1;
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
