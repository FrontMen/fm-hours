<i18n lang="yaml">
en:
  error: {
    employee: {
      notFound:  "You haven't been added to the app yet. <br />
                  Reach out to your manager to get access. <br />
                  Afterwards refresh the page and start writing hours!"
    }
  }

nl:
  error: {
      employee: {
        notFound: "Je bent nog niet toegevoegd aan de app. <br />
                   Neem contact op met je manager voor toegang. <br />
                   Hierna kun je de pagina verversen en beginnen met uren schrijven!"
      }
    }
 
</i18n>

<template>
  <b-alert variant="danger" show>
    <center>
      <p v-if="isEmployeeNotFound" v-html="$t('error.employee.notFound')"></p>
      <p v-else>{{employeeError}}</p>
    </center>
  </b-alert>
</template>

<script lang="ts">
import {defineComponent, useStore} from "@nuxtjs/composition-api";
import {Errors} from '~/types/enums';


export default defineComponent({
  setup() {
    const getters = useStore().getters;
    const employeeError = getters["employee/error"];
    const isEmployeeNotFound = employeeError.message === Errors.EMPLOYEE_NOT_FOUND;

    return {
      isEmployeeNotFound,
      employeeError
    };

  }

});
</script>
