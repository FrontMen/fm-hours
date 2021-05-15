<template>
  <div class="page-wrapper">
    <div class="content-wrapper my-5">
      <b-table
        class="mt-3 app-table timesheet-table"
        responsive
        :items="tableData.items"
        :fields="tableData.fields"
        :sort-compare="sortCompare"
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
                `${scope.field.formatedStartDate} ${scope.field.formatedEndDate}`
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
            @click="openEmployeeTimesheetPage(scope.item.id, scope.field.key)"
          />
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useRouter,
  useStore,
} from "@nuxtjs/composition-api";

import TimesheetEmployeeRow from "~/components/timesheets/timesheet-employee-row.vue";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  middleware: ["isAdmin"],
  components: { TimesheetEmployeeRow },

  head: {
    title: "Timesheets",
  },

  setup() {
    const store = useStore<RootStoreState>();

    const weeksBefore = 4;
    const weeksAfter = 4;

    const tableData = computed(() => store.state.timesheets.timesheetTableData);
    store.dispatch("timesheets/getTableData", {
      weeksBefore,
      weeksAfter,
    });

    const router = useRouter();
    const openEmployeeTimesheetPage = (
      employeeId: string,
      startTimestamp: number
    ) => {
      router.push(`/timesheets/${employeeId}/${startTimestamp}`);
    };

    const sortCompare = (
      a: TimesheetTableItem,
      b: TimesheetTableItem,
      key: string
    ) => {
      if (key === "id") {
        return a.name.localeCompare(b.name);
      }
    };

    return {
      recordStatus,
      openEmployeeTimesheetPage,
      tableData,
      sortCompare,
    };
  },
});
</script>

<style lang="scss">
.timesheet-table > .table.b-table > thead > tr > .table-b-table-default,
.timesheet-table > .table.b-table > thead > tr > th {
  background: var(--color-primary);
  color: var(--color-primary-text);
  padding-top: 1rem;
  padding-bottom: 1rem;
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
