<template>
    <b-container fluid class="d-flex justify-content-center login-wrapper">
        <img src="@/assets/images/logo.png" alt="Frontmen logo">
        <h1>Login</h1>
        <p>Login to use the hours registration tool</p>
        <b-button class="login-button" @click="login()">Login</b-button>
    </b-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  layout: 'login',

  methods: {
    login() {
      //this.$router.push('/hours');
      this.$store.dispatch('user/login');
    }
  }
})
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
