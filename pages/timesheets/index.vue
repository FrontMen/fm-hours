<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <b-container fluid class="app-table">
        <b-row class="app-table__top-row py-3">
          <b-col>
            <span class="font-weight-bold">Users</span>
          </b-col>
        </b-row>

        <b-row
          v-for="user in users"
          :key="user.id"
          class="app-table__row user-row py-3"
          no-gutters
          @click="openUserTimesheetPage(user)"
        >
          <b-col cols="0" class="mr-4">
            <b-avatar :src="user.picture" />
          </b-col>

          <b-col>
            <div class="font-weight-bold">
              {{ user.name }}
            </div>

            <div v-if="user.status === recordStatus.NEW" class="text-success">
              Nothing to approve
            </div>

            <div
              v-if="user.status === recordStatus.PENDING"
              class="text-warning"
            >
              Waiting on approval
            </div>

            <div v-if="user.status === recordStatus.DENIED" class="text-danger">
              Has denied records
            </div>
          </b-col>
        </b-row>
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
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  middleware: ["isAdmin"],
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

<style lang="scss">
.user-row {
  cursor: pointer;
}
</style>
