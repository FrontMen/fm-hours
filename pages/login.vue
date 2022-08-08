<i18n lang="yaml">
en:
  title: "Consultancy hours"
  login: "Login"
  loginHint: "Login to use the hours registration tool"
  loading: "Loading..."
nl:
  title: "Consultancy uren"
  login: "Inloggen"
  loginHint: "Log in voor uren registratie en rapportage"
  loading: "Laden.."
</i18n>

<template>
  <b-container fluid class="d-flex justify-content-center login-wrapper">
    <section class="vh-100">
      <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col col-xl-10">
            <div class="card">
              <div class="row g-0">
                <div class="col-md-6 col-lg-5 d-none d-md-block">
                  <img
                    src="@/assets/images/bg-portrait-black.jpg"
                    alt="login form"
                    class="login-background img-fluid"
                  />
                </div>
                <div class="col-md-6 col-lg-7 d-flex align-items-center">
                  <div class="card-body p-4 p-lg-5 text-black">
                    <language-switch class="d-flex justify-content-end mb-2"></language-switch>
                    <form>
                      <div class="d-flex align-items-center mb-3 pb-1">
                        <span class="h1 fw-bold mb-0">{{ $t('title') }}</span>
                      </div>

                      <h5 class="fw-normal mb-3 pb-3">
                        {{ $t('loginHint') }}
                      </h5>

                      <div class="pt-1 mb-4">
                        <b-button
                          :disabled="isLoading"
                          class="login-button"
                          variant="primary"
                          @click="login()"
                        >
                          <b-spinner v-if="isLoading" class="mr-2" small />
                          {{ $t(buttonText) }}
                        </b-button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <b-alert :show="!!errorMessage" variant="danger" class="mt-3">
              {{ errorMessage }}
            </b-alert>
          </div>
        </div>
      </div>
    </section>
  </b-container>
</template>

<script lang="ts">
import {computed, defineComponent, useContext, useRouter, useStore,} from '@nuxtjs/composition-api';

export default defineComponent({
  layout: 'login',
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();
    const {localePath} = useContext();

    const isLoading = computed(() => store.state.auth.isLoading);
    const errorMessage = computed(() => store.state.auth.errorMessage);
    const buttonText = computed(() => (isLoading.value ? 'loading' : 'login'));

    const login = async () => {
      const login = await store.dispatch('auth/login');
      if (login) router.push(localePath('/'));
    };

    return {
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
  background: url(@/assets/images/io-blend.jpg) no-repeat left top;
  background-size: cover;
}

.login-background {
  border-radius: 0.25rem 0 0 0.25rem;
}

.login-button {
  min-width: 7rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.main-card {
  width: 25rem;
}

.logo {
  width: 80;
  height: 80px;
  margin-bottom: 20px;
}
</style>
