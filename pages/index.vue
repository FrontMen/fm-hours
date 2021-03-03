<template>
  <b-container fluid class="d-flex justify-content-center login-wrapper">
    <img src="@/assets/images/logo.png" alt="Frontmen logo" />

    <h1>Login</h1>
    <p>Login to use the hours registration tool</p>

    <b-button class="login-button" @click="login()"> Login </b-button>
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
    // FIXME: would be nice it can access user store directly
    const store = useStore<RootStoreState>();
    const router = useRouter();

    // @ts-ignore (FIXME: user store is not types yet)
    const isLoggedIn = computed(() => store.state.user.isLoggedIn);

    const login = () => {
      store.dispatch("user/login");
    };

    watch(isLoggedIn, () => {
      if (isLoggedIn) {
        router.push("/hours");
      }
    });

    return {
      isLoggedIn,
      login,
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
}
</style>
