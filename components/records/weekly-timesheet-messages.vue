<i18n lang="yaml">
en:
  AddComment: "Add comment"
  Comments: "Comments"
  ShowWeekends: "Show weekends"
nl:
  AddComment: "Notitie toevoegen"
  Comments: "Notities"
  ShowWeekends: "Toon weekenden"
</i18n>

<template>
  <div class="controls col-6 col-md-5 pb-4">
    <b-row align-h="end" class="m-0 m-md-2 mr-0 mr-md-2">
      <b-dropdown offset="-140" class="messages-dropdown">
        <template #button-content>
          {{ $t("Comments") }}
          <b-badge pill variant="success">{{ formatedComments.length }}</b-badge>
        </template>
        <div>
          <b-dropdown-text
            v-for="comment in formatedComments"
            :key="comment.id"
            class="dropdown-text"
          >
            <p>{{ comment.text }}</p>
            <div class="text-right">
              <p class="date-format">
                {{ comment.createdAt }}
              </p>
              <p class="name-format">
                {{ comment.employeeName }}
              </p>
            </div>
            <b-dropdown-divider></b-dropdown-divider>
          </b-dropdown-text>
        </div>

        <b-dropdown-form v-if="!readonly">
          <b-form-group label-for="dropdown-form-comment" @submit.stop.prevent>
            <b-form-textarea
              id="dropdown-form-comment"
              v-model="messageInput"
              placeholder="add your comment"
              rows="3"
            ></b-form-textarea>
          </b-form-group>
          <b-button variant="primary" size="sm" @click="onAddCommentClick">
            {{ $t("AddComment") }}
          </b-button>
        </b-dropdown-form>
      </b-dropdown>
      <div class="d-none d-md-flex">
        <b-form-checkbox
          :checked="showWeekends"
          switch
          size="lg"
          class="ml-3 d-flex align-items-center"
          @change="$emit('toggle-weekends', !showWeekends)"
        >
          {{ $t('ShowWeekends') }}
        </b-form-checkbox>
      </div>

      <div class="d-md-none">
        <b-form-checkbox
          :checked="showWeekends"
          switch
          class="ml-3 d-flex align-items-center"
          @change="$emit('toggle-weekends', !showWeekends)"
        >
          {{ $t('ShowWeekends') }}
        </b-form-checkbox>
      </div>
    </b-row>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, PropType,
  ref, watch,
  useStore,
} from '@nuxtjs/composition-api';
import {format} from "date-fns";

export default defineComponent({
  props: {
    comments: {
      type: Array as PropType<Message[]>,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    showWeekends: {
      type: Boolean,
      default: true,
    }
  },
  emits: ['add', 'toggle-weekends'],

  setup(props, {emit}) {
    const messageInput = ref('');
    // get creatorName from store
    const store = useStore<RootStoreState>();
    const employeeName = computed(() => store.state.employee.employee?.name);

    const formatedComments = computed(() => props.comments
      .map((comment) => ({
        ...comment,
        createdAt: format(comment.createdAt, "dd/MM/yyyy HH:mm"),
      }))
    );

    // Clear the input when we get new comments
    watch(
      () => props.comments,
      () => {
        messageInput.value = ''
      }
    );

    const onAddCommentClick = () => {
      emit('add', {text: messageInput.value, employeeName: employeeName.value});
    };

    return {
      onAddCommentClick,
      formatedComments,
      messageInput,
    }
  },
})
</script>

<style lang="scss">
.messages-dropdown {
  .dropdown-text {
    width: 280px;
  }

  .b-dropdown-text {
    font-weight: 200;
  }

  .dropdown-menu {
    min-width: 280px;
  }
}

.date-format, .name-format {
  margin: 0;
  font-size: smaller;
}

#dropdown-form-comment {
  margin: 10px 0 0 0;
}
</style>
