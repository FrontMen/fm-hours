<template>
  <div class="page-wrapper">
    <div class="content-wrapper my-5">
      <b-table
        class="mt-3 app-table timesheet-table"
        responsive
        :items="tableData.items"
        :fields="tableData.fields"
      >
        <template #head(id)="scope">
          <div class="text-nowrap">
            {{ scope.label }}
          </div>
        </template>
        <template #head()="scope">
          <div class="text-nowrap">
            {{ scope.label }}
          </div>
        </template>
        <template #cell(id)="scope">
          <employee-cell
            :name="scope.item.name"
            :picture="scope.item.picture"
          />
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
import EmployeeCell from "~/components/timesheets/employee-cell.vue";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  middleware: ["isAdmin"],
  components: { TimesheetEmployeeRow, EmployeeCell },

  head: {
    title: "Timesheets",
  },

  setup() {
    const store = useStore<RootStoreState>();

    const weeksBefore = 8;
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
      router.push(`timesheets/${employeeId}/${startTimestamp}`);
    };

    return {
      recordStatus,
      openEmployeeTimesheetPage,
      tableData,
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

.timesheet-table td {
  vertical-align: inherit;
}

.container--cell {
  margin: auto;
  height: 40px;
  width: 40px;
  background-color: grey;
  cursor: pointer;
}

.container--cell.pending {
  background-color: #ff5900;
}

.container--cell.approved {
  background-color: #00cccc;
}
</style>
