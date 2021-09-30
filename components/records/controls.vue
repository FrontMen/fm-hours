<i18n lang="yaml">
  en:
    AddComment: "Add comment"
    Comments: "Comments"
    SaveComment: "Save comment"
  nl:
    AddComment: "Notitie toevoegen"
    Comments: "Comments"
    SaveComment: "Save comment"
</i18n>

<template>
  <div class="controls">
    <b-row align-h="end" class="m-2">
      <b-dropdown offset="-160">
        <template #button-content>
          {{ $t("Comments") }}
        </template>
        <div>
          <b-dropdown-text
            v-for="comment in formatedComments"
            :key="comment.id"
            style="width: 280px;"
          >
            <p>{{ comment.text }}</p>
            <p class="dateFormat" style="text-align: end;">
              {{ comment.createdAt }}
            </p>
            <b-dropdown-divider></b-dropdown-divider>
          </b-dropdown-text>
          <b-button
            class="addComment"
            style="width: 260px;"
            @click="onAddCommentClick"
          >
            {{ $t("AddComment") }}
          </b-button>
        </div>

        <b-dropdown-form v-if="showCommentForm">
          <b-form-group label-for="dropdown-form-comment" @submit.stop.prevent>
            <b-form-textarea
              id="dropdown-form-comment"
              v-model="messageInput"
              placeholder="add your comment"
              rows="3"
              @change="handleChange"
            ></b-form-textarea>
          </b-form-group>
          <b-button variant="primary" size="sm" @click="handleSaveClick">
            {{ $t("SaveComment") }}
          </b-button>
        </b-dropdown-form>
      </b-dropdown>
    </b-row>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
} from '@nuxtjs/composition-api';
import {format} from "date-fns";
import { uuidv4 } from '~/helpers/helpers';


export default defineComponent({
  emits: ['save'],

  setup(_, {emit}) {
    const store = useStore<RootStoreState>();
    const messageInput = ref('');
    const hasUnsavedChanges = ref<Boolean>(false);
    const showCommentForm = ref<Boolean>(false);
    const comments = computed(() => store.state.timesheets?.timesheets[0]?.messages || []);
    const formatedComments = computed(() => comments.value
        .map((comment) => ({
          ...comment,
          createdAt: formatDate(comment.createdAt),
        }))
    );

    const formatDate = (timestamp: number) => format(timestamp, "dd/MM/yyyy HH:mm");
    const handleSaveClick = () => {
      messageInput.value = '';
      showCommentForm.value = false;
      emit('save')
    };
    const handleChange = () => emit('changeInput', [...comments.value, createNewMessage(messageInput.value)]);
    const createNewMessage = (text: string): Message => ({
        id: uuidv4(),
        createdAt: new Date().getTime(),
        text,
      });
    const onAddCommentClick = () => {
      showCommentForm.value = true;
    };
    const onSaveCommentClick = () => {
      showCommentForm.value = false;
    };

    return {
      onAddCommentClick,
      onSaveCommentClick,
      handleSaveClick,
      handleChange,
      hasUnsavedChanges,
      formatedComments,
      showCommentForm,
      messageInput
    }
  },
  })
</script>

<style lang="scss">
.b-dropdown-text {
  font-weight: 200;
  text-align: end;
}
.dropdown-item {
  border: 1px solid lightgray;
  margin: auto;
  width: 80%;
  text-align: center;
  border-radius: 5px;
  font-size: small;
}

.dropdown-menu {
  min-width: 280px;
}

.dateFormat {
  font-size: smaller;
}

.addComment {
  margin: 0 auto;
  display: block;
}

#dropdown-form-comment {
  margin: 10px 0 0 0;
}
</style>
