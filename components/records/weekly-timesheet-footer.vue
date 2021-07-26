<template>
  <div class="weekly-timesheet-footer">
    <div class="weekly-timesheet-footer__status">
      <span v-if="lastSaved">Last saved: {{ lastSavedLabel }} ago</span>
      <b-spinner v-if="isSaving" class="ml-1" small />
    </div>

    <b-button
      v-if="canSubmitForApproval"
      :disabled="isSaving || !hasUnsavedChanges"
      @click="handleSaveClick"
    >
      Update
    </b-button>

    <b-button
      v-if="canUnsubmitForApproval"
      :disabled="isSaving"
      @click="handleUnsubmitClick"
    >
      Unsubmit
    </b-button>

    <b-button
      :disabled="isSaving || !canSubmitForApproval"
      @click="handleSubmitClick"
    >
      {{ submitButtonLabel }}
    </b-button>
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
  emits: ["submit", "save", "unsubmit"],
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
    const lastSavedLabel = ref("");
    let intervalHandle: NodeJS.Timeout;

    const handleSaveClick = () => emit("save");
    const handleSubmitClick = () => emit("submit");
    const handleUnsubmitClick = () => emit("unsubmit");

    const submitButtonLabel = computed(() => {
      switch (props.status) {
        case recordStatus.PENDING:
          return "Waiting on approval";
        case recordStatus.APPROVED:
          return "Approved";
        case recordStatus.DENIED:
          return "Resubmit for approval";
        default:
          return "Submit for approval";
      }
    });

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
      submitButtonLabel,
      canSubmitForApproval,
      canUnsubmitForApproval,
      lastSavedLabel,
    };
  },
});
</script>

<style lang="scss" scoped>
.weekly-timesheet-footer {
  display: flex;
  gap: 16px;
  flex-direction: column;

  @media (min-width: 560px) {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }

  &__status {
    display: inline-flex;
    align-items: center;
  }
}
</style>
