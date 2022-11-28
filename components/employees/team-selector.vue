<template>
  <b-form-select :value="value" :options="teamList" class="mb-3" @change="$emit('input', $event)" />
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, PropType, useContext, useStore} from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    value: {
      type: String as PropType<string>,
      required: false,
      default: '',
    },
    allowNone: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['input'],
  setup(props) {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();
    const teams = computed(() => store.state.teams.teams);

    const NO_TEAM = {
      value: 'none',
      text: i18n.t('noTeam')
    };

    onMounted(() => {
      store.dispatch('teams/get');
    });

    const teamList = computed(() => {
      const parsedTeam = teams.value.map((team: Team) => ({value: team.id, text: team.name}));
      return [
        {value: '', text: i18n.t("selectTeam")},
        ...(props.allowNone ? [NO_TEAM] : []),
        ...parsedTeam];
    });

    return {teamList}
  }
});
</script>
