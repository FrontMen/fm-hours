<i18n lang="yaml">
en:
  editTeam: "Edit team"
nl:
  editTeam: "Team bewerken"
</i18n>
<template>
  <div>
    <h6 class="mb-3">{{ $t('editTeam') }}:</h6>
    <b-form-select
      :value="selectedTeam"
      :options="teamList"
      class="mb-3"
      @change="$emit('update', $event)"
    />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, useContext, useStore} from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    selectedTeam: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
  },
  emits: ['update'],
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();
    const teams = computed(() => store.state.teams.teams);

    const teamList = computed(() => {
      const parsedTeam = teams.value.map(
        (team: Team) => {
          return {value: team.name, text: team.name};
        }
      );
      return [{value: null, text: i18n.t("selectTeam")}, ...parsedTeam];
    });

    return {teamList}
  }
});
</script>
