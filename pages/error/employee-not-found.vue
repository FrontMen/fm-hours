<i18n lang="yaml">
en:
  title: "Employee not found"
  description: "You haven't been added to the app yet. Reach out to your manager to get access. Afterwards refresh the page and start writing hours!"
  refresh: "Refresh"
nl:
  title: "Medewerker niet gevonden"
  description: "Je bent nog niet toegevoegd aan de app. Neem contact op met je manager voor toegang. Hierna kun je de pagina verversen en beginnen met uren schrijven!"
  refresh: "Vernieuwen"
</i18n>

<template>
  <b-container fluid class="d-flex justify-content-center text-center">
    <b-alert variant="danger" show class="mt-5 message">
      <h4 class="alert-heading">{{ $t('title') }}</h4>
      <p>{{ $t('description') }}</p>
      <b-button variant="danger" @click="refresh">{{ $t('refresh') }}</b-button>
    </b-alert>
  </b-container>
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  // @ts-ignore
  checkEmployee: false,
  middleware: ({store, redirect}) => {
    if (store.state.employee.isFound) {
      return redirect('/');
    }
  },
  setup() {
    const refresh = () => {
      window.location.reload();
    }

    return {
      refresh
    }
  }
});
</script>

<style>
.message {
  width: 25rem
}
</style>
