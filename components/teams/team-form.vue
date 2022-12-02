<i18n lang="yaml">
en:
  notFound: "Team not found"
  enterName: "Enter name"
nl:
  notFound: "Team niet gevonden"
  enterName: "Typ naam"
</i18n>

<template>
  <main class="page-wrapper">
    <section class="content-wrapper my-5">
      <template v-if="mode !== 'add' && !team">
        <p>{{ $t('notFound') }}</p>
      </template>
      <template v-else>
        <b-row>
          <b-col cols="5">
            <b-form @submit.prevent="save" @change="hasUnsavedChanges = true">
              <b-form-group id="input-group-name" :label="$t('name') + ':'" label-for="input-name">
                <b-form-input
                  id="input-name"
                  v-model="form.name"
                  :placeholder="$t('enterName')"
                  required
                />
              </b-form-group>
              <div class="d-flex justify-content-between">
                <div v-if="mode !== 'add'">
                  <b-button v-if="team?.archived" variant="warning" @click="unarchive">
                    {{ $t('unarchive') }}
                    <b-icon icon="archive" class="mr-1" />
                  </b-button>
                  <b-button v-else variant="warning" @click="archive">
                    {{ $t('archive') }}
                    <b-icon icon="archive" class="mr-1" />
                  </b-button>
                  <b-button variant="danger" @click="remove">
                    {{ $t('delete') }}
                    <b-icon icon="trash-fill" class="mr-1" />
                  </b-button>
                </div>
                <b-button
                  type="submit"
                  class="ml-auto"
                  variant="primary"
                  :disabled="!hasUnsavedChanges"
                >
                  {{ $t('save') }}
                  <b-icon icon="file-earmark-arrow-down" class="ml-1" />
                </b-button>
              </div>
            </b-form>
          </b-col>
        </b-row>
      </template>
    </section>
  </main>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  useContext,
  useMeta,
  useRouter,
  useStore,
  watch,
} from '@nuxtjs/composition-api';

export default defineComponent({
  props: {
    mode: {
      type: String,
      required: true,
      validator: (value: string) => {
        return ['add', 'edit'].includes(value);
      },
    },
    team: {
      type: Object as PropType<Team>,
      required: false,
      default: null,
    },
  },
  setup(props: {mode: string; team: Team}) {
    const {i18n} = useContext();
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const hasUnsavedChanges = ref<boolean>(false);
    const form = ref<Omit<Team, 'id'>>({
      name: '',
    });

    watch(
      () => props.team,
      () => {
        form.value = props.team ? {...props.team} : {name: ''};
      }
    );

    const pageTitle = computed(() =>
      props.team ? `${i18n.t('team')} - ${props.team.name}` : (i18n.t('addTeam') as string)
    );

    useMeta(() => ({title: pageTitle.value}));

    const save = () => {
      if (props.mode === 'edit') {
        store.dispatch('teams/update', {
          ...form.value,
          id: props.team.id,
        });
      } else if (props.mode === 'add') {
        store.dispatch('teams/add', form.value);
      }

      hasUnsavedChanges.value = false;
      router.push('/admin/teams');
    };

    const remove = () => {
      store.dispatch('teams/delete', props.team);
      router.push('/admin/teams');
    };
    const archive = () => {
      store.dispatch('teams/archive', props.team);
      router.push('/admin/teams');
    };
    const unarchive = () => {
      store.dispatch('teams/unarchive', props.team);
      router.push('/admin/teams');
    };

    return {
      hasUnsavedChanges,
      form,
      save,
      remove,
      archive,
      unarchive,
    };
  },
  head: {},
});
</script>
