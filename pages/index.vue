<template>
  <div>
    <div>
        <h1 class="title">Login</h1>
        
        <b-container fluid>
            <b-form @submit="onSubmit">
                <b-form-group
                    id="input-group-1"
                    label-for="input-1"
                >
                    <b-form-input
                        id="input-1"
                        v-model="form.email"
                        type="email"
                        required
                        placeholder="Enter email"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                    id="input-group-1"
                    label-for="input-1"
                >
                    <b-form-input
                        id="input-2"
                        v-model="form.name"
                        type="password"
                        required
                        placeholder="Enter password"
                    ></b-form-input>
                </b-form-group>
                <b-button type="submit" variant="primary">Login</b-button>
            </b-form>
        </b-container>

    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data() {
      return {
        form: {
          email: '',
          password: '',
          test: ''
        },
      }
    },
    created() {
      this.$store.dispatch('customers/getCustomers');
    },
    methods: {
      async onSubmit(evt: any) {
        evt.preventDefault()
        let provider = new this.$fireModule.auth.GoogleAuthProvider();
        await this.$fire.auth.signInWithPopup(provider)
      },
    }
})
</script>

<style>

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
