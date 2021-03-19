<template>
  <div class="weekly-timesheet-footer">
    <div>
      <span v-if="lastSaved" class="mr-3"
        >Last saved: {{ lastSavedLabel }}</span
      >
      <b-spinner v-if="isSaving" small />

      <b-button
        v-if="!isClosed || hasUnsavedChanges"
        class="mr-3"
        :disabled="isSaving"
        @click="handleSaveClick"
      >
        Save
      </b-button>
    </div>

    <template v-if="!isClosed">
      <b-button
        class="mr-3"
        variant="danger"
        :disabled="isSaving"
        @click="handleDenyClick"
      >
        Deny
      </b-button>

      <b-button
        variant="success"
        :disabled="isSaving"
        @click="handleApproveClick"
      >
        Approve
      </b-button>
    </template>

    <template v-else>
      <template v-if="isApproved">
        <strong>APPROVED</strong>
        <b-icon class="ml-1" icon="check-circle-fill" variant="success" />
      </template>

      <template v-else>
        <strong>DENIED</strong>
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
} from "@nuxtjs/composition-api";
import { formatDistanceToNow } from "date-fns";
import { recordStatus } from "~/helpers/record-status";

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
      type: String as PropType<RecordStatus>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const lastSavedLabel = ref("");
    let intervalHandle: NodeJS.Timeout;

    const handleSaveClick = () => emit("save");
    const handleDenyClick = () => emit("deny");
    const handleApproveClick = () => emit("approve");

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
      { immediate: true }
    );

    onBeforeUnmount(() => clearInterval(intervalHandle));

    return {
      handleSaveClick,
      handleDenyClick,
      handleApproveClick,
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
