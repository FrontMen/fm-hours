<i18n lang="yaml">
  en:
    deny: "Deny"
    approve: "Approve"
    undo: "Undo approval"
  nl:
    deny: "#required"
    approve: "#required"
    undo: "#required"
</i18n>

<template>
  <div class="weekly-timesheet-footer mb-3">
    <div>
      <span v-if="lastSaved" class="mr-3">
        {{$t('lastSave', {time: lastSavedLabel})}}
      </span>
      <b-spinner v-if="isSaving" small />

      <b-button
        v-if="!isClosed || hasUnsavedChanges"
        class="mr-3"
        :disabled="isSaving || !hasUnsavedChanges"
        @click="handleSaveClick"
      >
        {{$t('update')}}
      </b-button>
    </div>

    <b-button
      v-if="!isApproved"
      class="mr-3"
      variant="warning"
      :disabled="isSaving"
      @click="handleReminderClick"
    >
      {{$t('sendReminder')}}
    </b-button>

    <template v-if="!isClosed">
      <b-button
        v-b-modal.deny-modal
        class="mr-3"
        variant="danger"
        :disabled="isSaving"
      >
        {{$t('deny')}}
      </b-button>

      <b-button
        variant="success"
        :disabled="isSaving"
        @click="handleApproveClick"
      >
        {{$t('approve')}}
      </b-button>
    </template>

    <template v-else>
      <template v-if="isApproved">
        <b-button
          class="mr-3 ml-3"
          variant="danger"
          :disabled="isSaving"
          @click="handleUndoApproveClick"
        >
          {{$t('undo')}}
        </b-button>
        <strong class="text-uppercase">{{$t('approved')}}</strong>
        <b-icon class="ml-1" icon="check-circle-fill" variant="success" />
      </template>

      <template v-else>
        <strong class="text-uppercase">{{$t('denied')}}</strong>
        <b-icon class="ml-1" icon="x-circle-fill" variant="danger" />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  PropType,
  ref,
  watch,
} from '@nuxtjs/composition-api';
import {formatDistanceToNow} from 'date-fns';
import {recordStatus} from '~/helpers/record-status';

export default defineComponent({
  emits: ['submit', 'save', 'unsubmit', 'reminder'],
  props: {
    hasUnsavedChanges: {
      type: Boolean,
      default: false,
    },
    isSaving: {
      type: Boolean,
      required: true,
    },
    lastSaved: {
      type: Date,
      required: false,
    },
    status: {
      type: String as PropType<TimesheetStatus>,
      required: true,
    },
  },
  setup(props, {emit}) {
    const lastSavedLabel = ref('');
    let intervalHandle: NodeJS.Timeout;

    const handleSaveClick = () => emit('save');
    const handleApproveClick = () => emit('approve');
    const handleUndoApproveClick = () => emit('unapprove');
    const handleReminderClick = () => emit('reminder');

    const isApproved = computed(() => props.status === recordStatus.APPROVED);
    const isDenied = computed(() => props.status === recordStatus.DENIED);
    const isClosed = computed(() => isApproved.value || isDenied.value);

    const updateLastSavedLabel = () => {
      lastSavedLabel.value = formatDistanceToNow(props.lastSaved || 0);
    };

    const setIntervalHandle = () => {
      intervalHandle = setInterval(updateLastSavedLabel, 1000);
    };

    watch(
      () => props.lastSaved,
      () => {
        updateLastSavedLabel();
        setIntervalHandle();
      },
      {immediate: true}
    );

    onBeforeUnmount(() => clearInterval(intervalHandle));

    return {
      handleSaveClick,
      handleApproveClick,
      handleUndoApproveClick,
      handleReminderClick,
      isClosed,
      isApproved,
      isDenied,
      lastSavedLabel,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
