<i18n lang="yaml">
  en:
    unsubmit: "Unsubmit"
    waiting: "Waiting on approval"
    denied: "Denied"
    submit: "Submit for approval"
    save: "Save"
    deny: "Deny"
    approve: "Approve"
    undo: "Undo approval"
  nl:
    unsubmit: "Terugtrekken"
    waiting: "Wacht op akkoord"
    denied: "Afgekeurd"
    submit: "Verzenden"
    save: "Opslaan"
    deny: "Afkeuren"
    approve: "Akkordeeren"
    undo: "Ongedaan maken"
</i18n>

<template>
  <div class="weekly-timesheet-footer mb-5">
    <div class="weekly-timesheet-footer__status">
      <template v-if="isPending">
        <b-icon class="mr-1" icon="clock-fill" variant="secondary" />
        <strong class="text-uppercase">{{$t('waiting')}}</strong>
      </template>

      <template v-if="isApproved">
        <b-icon class="mr-1" icon="check-circle-fill" variant="success" />
        <strong class="text-uppercase">{{$t('approved')}}</strong>
      </template>

      <template v-if="isDenied">
        <b-icon class="mr-1" icon="x-circle-fill" variant="danger" />
        <strong class="text-uppercase">{{$t('denied')}}</strong>
      </template>
    </div>

    <span v-if="lastSaved">{{$t('lastSave', {time: lastSavedLabel})}}</span>
    <b-spinner v-if="isSaving" class="ml-1" small />

    <div class="weekly-timesheet-footer__actions">
      <div v-if="isAdmin">
        <b-button
          v-if="!isApproved && !isPending"
          class="mr-3"
          variant="warning"
          :disabled="isSaving"
          @click="handleReminderClick"
        >
          {{$t('sendReminder')}}
        </b-button>

        <b-button-group v-if="isPending" class="mr-3">
          <b-button
            variant="danger"
            :disabled="isSaving"
            @click="handleDenyClick"
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
        </b-button-group>

        <b-button
          v-if="isApproved"
          class="mr-3"
          variant="danger"
          :disabled="isSaving"
          @click="handleUndoApproveClick"
        >
          {{$t('undo')}}
        </b-button>
      </div>

      <b-button
        v-if="isNew || isDenied"
        class="mr-3"
        :disabled="isSaving || !hasUnsavedChanges"
        @click="handleSaveClick"
      >
        {{$t('save')}}
      </b-button>

      <b-button
        v-if="isPending"
        class="mr-3"
        :disabled="isSaving"
        @click="handleUnsubmitClick"
      >
        {{$t('unsubmit')}}
      </b-button>

      <b-button
        v-if="isNew"
        class="mr-3"
        :disabled="isSaving || !canSubmitForApproval"
        @click="handleSubmitClick"
      >
        {{$t('submit')}}
      </b-button>
    </div>
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
} from "@nuxtjs/composition-api";
import {formatDistanceToNow} from "date-fns";
import {recordStatus} from "~/helpers/record-status";

export default defineComponent({
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
      default: null,
    },
    status: {
      type: String as PropType<TimesheetStatus>,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
  },
  emits: ["submit", "save", "unsubmit", "reminder"],
  setup(props, {emit}) {
    const lastSavedLabel = ref("");
    let intervalHandle: NodeJS.Timeout;

    const handleSaveClick = () => emit("save");
    const handleSubmitClick = () => emit("submit");
    const handleUnsubmitClick = () => emit("unsubmit");

    const handleApproveClick = () => emit('approve');
    const handleDenyClick = () => emit('deny');
    const handleUndoApproveClick = () => emit('unapprove');
    const handleReminderClick = () => emit('reminder');

    const isNew = computed(() => props.status === recordStatus.NEW);
    const isPending = computed(() => props.status === recordStatus.PENDING);
    const isApproved = computed(() => props.status === recordStatus.APPROVED);
    const isDenied = computed(() => props.status === recordStatus.DENIED);

    const isClosed = computed(() => isApproved.value || isDenied.value);

    const canSubmitForApproval = computed(
      () =>
        props.status === recordStatus.NEW ||
        props.status === recordStatus.DENIED
    );

    const canUnsubmitForApproval = computed(
      () => props.status === recordStatus.PENDING
    );

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
      handleSubmitClick,
      handleUnsubmitClick,
      handleApproveClick,
      handleDenyClick,
      handleUndoApproveClick,
      handleReminderClick,
      canSubmitForApproval,
      canUnsubmitForApproval,
      lastSavedLabel,
      isNew,
      isPending,
      isApproved,
      isDenied,
      isClosed,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-footer {
  display: flex;
  flex-direction: column;

  @media (min-width: 560px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  &__status {
    display: inline-flex;
    align-items: center;
  }

  &__actions {
    display: flex;
    flex-direction: row;
  }
}
</style>
