<i18n lang="yaml">
  en:
    login: "Login"
    loginHint: "Login to use the hours registration tool"
    loading: "Loading..."
  nl:
    login: "#required"
    loginHint: "#required"
    loading: "#required"
</i18n>

<template>
  <b-container fluid class="d-flex justify-content-center login-wrapper">
    <b-card align="center">
      <img src="@/assets/images/logo.png" alt="Frontmen logo" />
      <h1>{{$t('login')}}</h1>
      <b-card-text>{{$t('loginHint')}}</b-card-text>

      here: {{isLoggedIn}} here

      <b-button variant="dark" class="m-2">
        <language-switch></language-switch>
      </b-button>
      <b-button :disabled="isLoading" class="login-button" @click="login()">
        <b-spinner v-if="isLoading" class="mr-2" small />
        {{ $t(buttonText) }}
      </b-button>
    </b-card>
    <b-alert :show="!!errorMessage" variant="danger" class="mt-3">
      {{ errorMessage }}
    </b-alert>
  </b-container>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useStore,
} from "@nuxtjs/composition-api";
import languageSwitch from "~/components/app/language-switch.vue";

export default defineComponent({
  components: { languageSwitch },
  layout: "default",
  setup() {
    const store = useStore<RootStoreState>();

    const isLoggedIn = computed(() => store.state.employee.isLoggedIn);
    const isLoading = computed(() => store.state.employee.isLoading);
    const errorMessage = computed(() => store.state.employee.errorMessage);
    const buttonText = computed(() =>
      isLoading.value ? "loading" : "login"
    );

    const login = () => {
      // HACKY "FIX" TO LOG IN PRODUCTION (remove setTimeout once the issue is really fixed)
      // setTimeout(() => router.push(localePath("/records")), 5000);
      store.dispatch("employee/login");
    };

    return {
      isLoggedIn,
      login,
      isLoading,
      errorMessage,
      buttonText,
    };
  },
});
</script>

<style>
.login-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  flex-flow: column;
  justify-content: center;
}

.login-button {
  font-size: 20px;
  display: flex;
  align-items: center;
  margin: 0 auto;
}
</style>
