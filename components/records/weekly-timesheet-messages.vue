<i18n lang="yaml">
  en:
    AddComment: "Add comment"
    Comments: "Comments"
  nl:
    AddComment: "Notitie toevoegen"
    Comments: "Comments"
</i18n>

<template>
  <div class="controls">
    <b-row align-h="end" class="m-2">
      <b-dropdown offset="-160">
        <template #button-content>{{ $t("Comments") }} ({{formatedComments.length}})</template>
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
    </b-row>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent, PropType,
  ref, watch,
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
    }
  },
  emits: ['add'],

  setup(props, {emit}) {
    const messageInput = ref('');

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
      emit('add', messageInput.value);
    };

    return {
      onAddCommentClick,
      formatedComments,
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

#dropdown-form-comment {
  margin: 10px 0 0 0;
}
</style>
