<i18n lang="yaml">
en:
  manageTeam: "Manage team"
  addTeam: "Add a team"
nl:
  manageTeam: "Team bewerken"
  addTeam: "Team toevoegen"
</i18n>

<template>
  <admin-container>
    <b-container fluid class="mb-3">
      <b-row class="justify-content-between">
        <b-col cols="6" class="pl-0 d-flex align-items-center">
          <b-form-group class="mb-0 mr-4">
            <b-input-group>
              <b-form-input
                id="filter-input"
                v-model="filter"
                type="search"
                :placeholder="$t('filter')"
              />

              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">
                  {{ $t('clear') }}
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

          <b-form-checkbox v-model="archived" switch>
            {{ $t('showArchived') }}
          </b-form-checkbox>
        </b-col>
        <b-col cols="auto">
          <nuxt-link class="btn btn-primary" :to="localePath(`/admin/teams/add`)">
            {{ $t('addTeam') }}
            <b-icon icon="people" />
          </nuxt-link>
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
        :items="items"
        :fields="fields"
        :filter="filter"
      >
        <template #head()="data">
          {{ $t(data.label) }}
        </template>
        <template #cell(archived)="scope">
          <b-badge :variant="scope.item.archived ? 'warning' : 'info'">
            {{ scope.item.archived ? $t('yes') : $t('no') }}
          </b-badge>
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
  </admin-container>
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
} from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();
    const teams = computed(() => store.state.teams.teams);

    useMeta(() => ({
      title: i18n.t('teams') as string,
    }));

    onMounted(() => {
      store.dispatch('teams/get');
    });

    const filter = ref<string>('');
    const archived = ref<boolean>(false);
    const fields = [
      {key: 'name', label: 'name', sortable: true},
      {key: 'archived', label: 'archived', sortable: false, class: 'text-center'},
      {key: 'actions', label: 'actions', sortable: false, class: 'text-right'},
    ];

    const items = computed(() => {
      return teams.value.filter(team => {
        return archived.value ? true : team.archived !== true;
      });
    });

    return {
      filter,
      archived,
      fields,
      items,
    };
  },
  head: {},
});
</script>
