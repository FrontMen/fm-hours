<template>
  <div>
    <div>
        <b-container>
            9 - 15 oktober 2020
        </b-container>
        <b-container>
            <b-row class="text-center">
                <b-col></b-col>
                <b-col>
                    <b-container>
                    <b-row class="text-center">
                        <b-col>Ma</b-col>
                        <b-col>Di</b-col>
                        <b-col>Wo</b-col>
                        <b-col>Do</b-col>
                        <b-col>Vr</b-col>
                        <b-col>Za</b-col>
                        <b-col>Zo</b-col>
                    </b-row>
                    </b-container>
                </b-col>
                <b-col cols="2"></b-col>
            </b-row>
            <b-row>
                <b-col>
                    Rabobank
                    <div>Project hypotheken</div>
                </b-col>
                <b-col>
                    <b-container>
                    <b-row class="text-center">
                        <b-col>
                            <b-form-input type="text"></b-form-input>
                        </b-col>
                        <b-col>
                            <b-form-input type="text"></b-form-input>
                        </b-col>
                        <b-col>
                            <b-form-input type="text"></b-form-input>
                        </b-col>
                        <b-col>
                            <b-form-input type="text"></b-form-input>
                        </b-col>
                        <b-col>
                            <b-form-input type="text"></b-form-input>
                        </b-col>
                        <b-col>
                            <b-form-input type="text"></b-form-input>
                        </b-col>
                        <b-col>
                            <b-form-input type="text"></b-form-input>
                        </b-col>
                    </b-row>
                    </b-container>
                </b-col>
                <b-col cols="2"></b-col>
            </b-row>
            <b-row>
                <b-col>New row</b-col>
                <b-col>
                    <b-container>
                    <b-row class="text-center">
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                        <b-col>0</b-col>
                    </b-row>
                    </b-container>
                </b-col>
                <b-col cols="2"></b-col>
            </b-row>
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
          name: '',
        },
      }
    },
    methods: {
      onSubmit(evt) {
        evt.preventDefault()
        alert(JSON.stringify(this.form))
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
