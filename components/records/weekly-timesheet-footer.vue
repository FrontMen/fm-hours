<template>
  <div class="weekly-timesheet-footer">
    <div>
      <span v-if="lastSaved">Last saved: {{ lastSavedLabel }}</span>

      <b-button
        class="mx-3"
        :disabled="isSaving || !hasUnsavedChanges"
        @click="handleSaveClick"
      >
        <b-spinner v-if="isSaving" small />
        Save
      </b-button>
    </div>

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
import { formatDistanceToNow } from "date-fns";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  emits: ["approve", "save"],
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
      type: String as PropType<RecordStatus>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const lastSavedLabel = ref("");
    let intervalHandle: NodeJS.Timeout;

    const handleSaveClick = () => emit("save");
    const handleSubmitClick = () => emit("submit");

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
      { immediate: true }
    );

    onBeforeUnmount(() => clearInterval(intervalHandle));

    return {
      handleSaveClick,
      handleSubmitClick,
      submitButtonLabel,
      canSubmitForApproval,
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
