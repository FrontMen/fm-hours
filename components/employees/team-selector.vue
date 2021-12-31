<i18n lang="yaml">
en:
  editTeam: "Edit team"
nl:
  editTeam: "Team bewerken"
</i18n>
<template>
  <div>
    <h6 class="mb-3">{{ $t('editTeam') }}:</h6>
    <b-form-select
      v-model="selectedTeam"
      :options="teamList"
      class="mb-3"
      @change="edited"
    />
  </div>
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    selectedTeam: {
      type: String,
      required: false,
      default: '',
    },
    teamList: {
      type: String,
      required: true,
    }
  }
});
</script>

<style scoped></style>
