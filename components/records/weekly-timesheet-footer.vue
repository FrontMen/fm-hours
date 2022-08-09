<i18n lang="yaml">
en:
  unsubmit: "Unsubmit"
  waiting: "Waiting on approval"
  denied: "Denied"
  submit: "Submit for approval"
  save: "Save concept"
  deny: "Deny"
  approve: "Approve"
  undo: "Undo approval"
  addBridge: "Add to bridge"
  removeBridge: "Remove from bridge"
  validate: "Are the hours complete?"
nl:
  unsubmit: "Terugtrekken"
  waiting: "Indienen gelukt. Wacht op akkoord"
  denied: "Afgekeurd"
  submit: "Indienen"
  save: "Concept opslaan"
  deny: "Afkeuren"
  approve: "Akkordeeren"
  undo: "Ongedaan maken"
  addBridge: "Toevoegen aan bridge"
  removeBridge: "Verwijderen van bridge"
  validate: "Kloppen de totalen?"
</i18n>

<template>
  <div class="weekly-timesheet-footer mb-5">
    <div v-if="lastSaved" class="d-flex  mr-2">
      <span>{{ $t('lastSave', {time: lastSavedLabel}) }}</span>
    </div>

    <div class="weekly-timesheet-footer__status">
      <template v-if="isPending">
        <b-alert show variant="primary">
          <b-icon class="mr-1" icon="clock" variant="secondary" />
          {{ $t('waiting') }}
        </b-alert>
      </template>

      <template v-if="isApproved">
        <b-alert show variant="success">
          <b-icon class="mr-1" icon="check-circle-fill" variant="success" />
          <strong class="text-uppercase">{{ $t('approved') }}</strong>
        </b-alert>
      </template>

      <template v-if="isDenied">
        <b-alert show variant="danger">
          <b-icon class="mr-1" icon="x-circle-fill" variant="danger" />
          <strong class="text-uppercase">{{ $t('denied') }}</strong>
        </b-alert>
      </template>
    </div>

    <div class="weekly-timesheet-footer__actions">
      <div v-if="isAdmin">
        <b-button-group v-if="isPending" class="mr-3">
          <b-button variant="danger" size="lg" :disabled="isSaving" @click="handleDenyClick">
            {{ $t('deny') }}
            <b-icon icon="file-earmark-x"></b-icon>
          </b-button>

          <b-button variant="success" size="lg" :disabled="isSaving" @click="handleApproveClick">
            {{ $t('approve') }}
            <b-icon icon="file-earmark-check"></b-icon>
          </b-button>
        </b-button-group>

        <div>
          <b-button-group class="mr-3">
            <b-button
              variant="outline-primary"
              :disabled="isSaving"
              @click="handleRemoveFromBridgeClick"
            >
              {{ $t('removeBridge') }}
            </b-button>

            <b-button
              variant="outline-primary"
              :disabled="isSaving"
              @click="handleAddToBridgeClick"
            >
              {{ $t('addBridge') }}
            </b-button>
          </b-button-group>

          <b-button
            class="mr-3"
            variant="danger"
            :disabled="isSaving"
            @click="handleUndoApproveClick"
          >
            {{ $t('undo') }}
          </b-button>
        </div>
      </div>

      <b-overlay
        :show="isSaving"
        rounded
        opacity="0.6"
        spinner-small
        spinner-variant="primary"
        class="d-inline-block"
        @hidden="onHidden"
      >
        <b-button
          v-if="isNew || isDenied"
          class="mr-3"
          size="lg"
          variant="secondary"
          :disabled="isSaving || !hasUnsavedChanges"
          @click="handleSaveClick"
        >
          {{ $t('save') }}
          <b-icon icon="file-earmark-arrow-down" />
        </b-button>
      </b-overlay>

      <b-button
        v-if="isPending"
        size="lg"
        variant="warning"
        :disabled="isSaving"
        @click="handleUnsubmitClick"
      >
        {{ $t('unsubmit') }}
        <b-icon icon="file-earmark-x" />
      </b-button>

      <b-button
        v-if="isNew"
        v-b-tooltip.hover="{ variant: 'secondary' }"
        :title="$t('validate')"
        size="lg"
        variant="primary"
        :disabled="isSaving || !canSubmitForApproval"
        @click="handleSubmitClick"
      >
        {{ $t('submit') }}
        <b-icon icon="file-earmark-arrow-up" />
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
  emits: ["submit", "save", "unsubmit", 'approve', 'deny', 'unapprove', 'bridgeAdd', 'bridgeRemove'],
  setup(props, {emit}) {
    const lastSavedLabel = ref("");
    let intervalHandle: NodeJS.Timeout;

    const handleSaveClick = () => emit("save");
    const handleSubmitClick = () => emit("submit");
    const handleUnsubmitClick = () => emit("unsubmit");

    const handleApproveClick = () => emit('approve');
    const handleDenyClick = () => emit('deny');
    const handleUndoApproveClick = () => emit('unapprove');

    const handleAddToBridgeClick = () => emit('bridgeAdd');
    const handleRemoveFromBridgeClick = () => emit('bridgeRemove');

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
      handleAddToBridgeClick,
      handleRemoveFromBridgeClick,
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
  data() {
    return {
      show: false
    }
  }
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
