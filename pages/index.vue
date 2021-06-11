<template>
  <b-container fluid class="d-flex justify-content-center login-wrapper">
    <b-card align="center">
      <img src="@/assets/images/logo.png" alt="Frontmen logo" />
      <h1>Login</h1>
      <b-card-text> Login to use the hours registration tool </b-card-text>

      <b-button :disabled="isLoading" class="login-button" @click="login()">
        <b-spinner v-if="isLoading" class="mr-2" small />
        {{ buttonText }}
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
  useRouter,
  useStore,
  watch,
} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isLoggedIn"],
  layout: "login",
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();

    const isLoggedIn = computed(() => store.state.employee.isLoggedIn);
    const isLoading = computed(() => store.state.employee.isLoading);
    const errorMessage = computed(() => store.state.employee.errorMessage);
    const buttonText = computed(() =>
      isLoading.value ? "Loading..." : "Login"
    );

    const login = () => {
      store.dispatch("employee/login");
    };

    watch(
      () => [isLoggedIn.value],
      () => {
        if (isLoggedIn.value) {
          router.push("/records");
        }
      }
    );

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
