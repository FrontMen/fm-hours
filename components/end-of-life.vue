<template>
  <div>
    <h1>We're moving to time writing in Bridge!</h1>
    <p>
      The last couple of months the bridge team added multiple features to time writing in Bridge
      which makes it suitable for us.
    </p>
    <p>That's why, starting April, we all will use Bridge for time writing.</p>
    <p>Use these contract names to find the right items to write hours in Bridge:</p>

    <b-table class="mb-4" striped :items="contracts" :fields="fields"></b-table>

    <b-button
      variant="success"
      href="https://bridge.hosted-tools.com/worklogs/calendar/grid"
      target="_blank"
    >
      Start writing hours in Bridge
      <b-icon icon="box-arrow-up-right" class="ml-1" aria-hidden="true" />
    </b-button>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useStore,
} from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();

    const timesheet = computed(() => store.state.timesheets.weeklyTimesheet);
    const contracts = computed(() => timesheet.value.projects.map((project) => project.project.contract));

    return {
      fields: [{ key: 'name', label: 'Contract' }, { key: 'project_name', label: 'Project' }],
      contracts,
    };
  },
});
</script>
