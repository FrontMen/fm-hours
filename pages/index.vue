<template>
  <div>
    <div>
        <h1 class="title">Login</h1>
        <b-container fluid>
            <b-button @click="login()">Login</b-button>
        </b-container>
    </div>
  </div>
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

</style>
