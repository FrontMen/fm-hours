<i18n lang="yaml">
  en:
    projectHint: "Or use 'n' to add project"
    copyPrevious: "Copy previous week"
  nl:
    projectHint: "#required"
    copyPrevious: "#required"
</i18n>

<template>
  <div class="empty-timesheet">
    <p>{{$t("noHoursThisWeek")}}</p>

    <template>
      <b-button
        v-b-modal.modal-add-project
        v-b-tooltip.hover
        :title="$t('projectHint')"
      >
        {{$t("addAProject")}}
      </b-button>
      <span class="d-none d-sm-inline mx-2">or</span>

      <b-button @click="handleCopyPreviousWeekClick">
        {{$t("copyPrevious")}}
      </b-button>
    </template>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  emits: ["copy-previous-week"],
  props: {
    isAdminView: {
      type: Boolean,
      default: false,
    },
  },
  setup(_, {emit}) {
    return {
      handleCopyPreviousWeekClick: () => emit("copy-previous-week"),
    };
  },
});
</script>

<style lang="scss">
.empty-timesheet {
  padding: 40px 8px;
  text-align: center;
  background-color: #fff;
  border-top: 8px solid var(--color-primary);
  border-radius: 8px;

  p {
    margin-bottom: 32px;
  }

  button {
    width: 100%;
    margin-top: 16px;

    @media (min-width: 576px) {
      width: auto;
      margin-top: 0;
    }
  }
}
</style>
