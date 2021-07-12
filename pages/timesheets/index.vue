<template>
  <div class="my-5 content-wrapper">
    <b-form-group
      label="Filter by:"
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
        <b-form-select
          id="filter-select"
          v-model="selected"
          :options="options"
          class="filter__select"
        >
          <template #first>
            <b-form-select-option :value="null">
              All
            </b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>
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
            :title="scope.item[scope.field.key]"
            @click="
              openEmployeeTimesheetPage(scope.item.id, scope.field.timestamp)
            "
          />
        </template>
      </b-form-select>
    </b-form-group>
    <b-table
      class="mt-3 app-table timesheet-table"
      responsive
      :items="tableData.items"
      :fields="tableData.fields"
      :sort-compare="sortCompare"
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
} from "@nuxtjs/composition-api";

import { recordStatus } from "~/helpers/record-status";
import { TimesheetStatus } from "~/types/enums";

export default defineComponent({
  middleware: ["isAdmin"],

  head: {
    title: "Timesheets",
  },

  setup() {
    const store = useStore<RootStoreState>();

    const options = Object.entries(TimesheetStatus)
      .map(([value, text]) => ({
        value,
        text,
      }))
      .sort((a, b) => a.text.localeCompare(b.text));

    const sortDescending= ref<boolean>(store.getters['filters/getTimesheetSortDescending']);
    const selected = ref(store.getters['filters/getTimesheetFilterBy']);
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

    const router = useRouter();
    const openEmployeeTimesheetPage = (
      employeeId: string,
      startTimestamp: number
    ) => {
      router.push(`/timesheets/${employeeId}/${startTimestamp}`);
    };

    const handleFilterUpdates = () => {
      if (store.getters['filters/getTimesheetFilterBy'] !== selected.value) {
        store.dispatch("filters/updateTimesheetFilterBy", selected.value);
      }
      if (store.getters['filters/getTimesheetSortDescending'] !== sortDescending.value) {
        store.dispatch("filters/updateTimesheetSortDescending", sortDescending.value);
      }
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
    };
  },
});
</script>

<style lang="scss">
.filter {
  &__select {
    text-transform: capitalize;
  }

  @media (min-width: 576px) {
    width: 25%;
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
