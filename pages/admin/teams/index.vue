<i18n lang="yaml">
en:
  manageTeam: "Manage team"
  addTeam: "Add a team"
nl:
  manageTeam: "Team bewerken"
  addTeam: "Team toevoegen"
</i18n>

<template>
  <div class="content-wrapper mt-5">
    <b-container fluid class="mb-3">
      <b-row class="justify-content-between">
        <b-col cols="6" md="auto" class="pl-0 mb-3"></b-col>
        <b-col cols="auto">
          <!-- <div class="d-flex justify-content-between align-items-center mt-1">
            <nuxt-link class="btn btn-primary" :to="localePath(`/admin/teams/add`)">
              {{ $t('addTeam') }}
              <b-icon icon="people" />
            </nuxt-link>
          </div> -->
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid class="mb-3">
      <b-table
        class="row"
        responsive
        striped
        hover
        small
        :items="teams"
        :fields="fields"
        :sort-compare="sortCompare"
        :sort-desc.sync="sortDescending"
        :sort-by.sync="sortKey"
        no-sort-reset
      >
        <template #head()="data">
          {{ $t(data.label) }}
        </template>

        <template #cell(actions)="scope">
          <div class="text-right">
            <nuxt-link
              class="btn btn-sm btn-primary"
              :to="localePath(`/admin/teams/${scope.item.id}`)"
              :title="$t('manageTeam')"
            >
              <b-icon icon="pencil-fill" />
            </nuxt-link>
          </div>
        </template>
      </b-table>
    </b-container>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, useStore,} from "@nuxtjs/composition-api";
import { sortByProp } from "~/helpers/helpers";

export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();

    onMounted(() => {
      store.dispatch('teams/get');
    });

    const sortDescending = ref<boolean>(false);
    const sortKey = ref<string>('');
    const fields = [
      {key: "name", label: "name", sortable: true},
      // {key: "actions", label: "actions", sortable: false, class: 'text-right'},
    ];
    const sortCompare = (a: Team, b: Team, key: keyof Team) => sortByProp<Team>(a, b, key);

    const teams = computed(() => store.state.teams.teams);

    return {
      fields,
      sortCompare,
      sortDescending,
      sortKey,
      teams
    };
  },
  head: {
    title: "Teams",
  },
});
</script>
