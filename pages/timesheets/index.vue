<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <b-container fluid class="app-table">
        <b-row class="app-table__top-row py-3">
          <b-col>
            <span class="font-weight-bold">Users</span>
          </b-col>
        </b-row>

        <timesheet-user-row
          v-for="user in users"
          :key="user.id"
          :user="user"
          @click="openUserTimesheetPage(user)"
        />
      </b-container>
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

import TimesheetUserRow from "~/components/timesheets/timesheet-user-row.vue";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  middleware: ["isAdmin"],
  components: { TimesheetUserRow },

  head: {
    title: "Timesheets",
  },

  setup() {
    const store = useStore<RootStoreState>();
    const users = computed(() => store.state.timesheets.users);
    store.dispatch("timesheets/getUserList");

    const router = useRouter();
    const openUserTimesheetPage = (user: TimesheetUser) => {
      router.push(`timesheets/${user.id}`);
    };

    return {
      users,
      recordStatus,
      openUserTimesheetPage,
    };
  },
});
</script>
