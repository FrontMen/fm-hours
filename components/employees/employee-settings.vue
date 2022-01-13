<i18n lang="yaml">
en:
  employeeSettings: "Employee Settings"
  email: "Email"
  admin: "Admin"
  standBy: "Standby"
  endDate: "End date"
  startDate: "Start date"
  noDate: "No date selected"
nl:
  employeeSettings: "Medewerker instellingen"
  email: "Email"
  admin: "Administrator"
  standBy: "Stand-by"
  endDate: "Eind datum"
  startDate: "Start datum"
  noDate: "Geen datum geselcteerd"
</i18n>

<template>
  <section>
    <h6 class="mb-3">{{ $t('employeeSettings') }}</h6>

    {{ $t('name') }}:
    <b-form-input
      v-model="localEmployee.name"
      type="text"
      class="mt-2 w-75 mb-2"
      :placeholder="$t('employeeName')"
      :trim="true"
      :state="nameValidationState"
      @change="nameTouched = true"
    />

    {{ $t('email') }}:
    <b-form-input
      v-model="localEmployee.email"
      type="email"
      class="mt-2 w-75 mb-2"
      :placeholder="$t('employeeEmail')"
      :state="emailValidationState"
      :trim="true"
      @change="emailTouched = true"
    />

    <b-form-checkbox v-model="isAdmin" switch class="mt-2 mr-3">
      {{ $t('admin') }}
    </b-form-checkbox>
    <b-form-checkbox
      v-model="localEmployee.travelAllowance"
      name="check-button"
      switch
    >
      {{ $t('travelAllowance') }}
    </b-form-checkbox>
    <b-form-checkbox v-model="localEmployee.standBy" switch class="mt-2 mr-3">
      {{ $t('standBy') }}
    </b-form-checkbox>
    <label class="mt-2" for="start-datepicker">{{ $t('startDate') }}:</label>
    <b-form-datepicker
      id="start-datepicker"
      v-model="localEmployee.startDate"
      :locale="isoLocale"
      class="w-75 mb-2"
      :label-no-date-selected="$t('noDate')"
    />
    <b-form-checkbox v-model="hasEndDate" name="check-button" switch>
      {{ $t('endDate') }}:
    </b-form-checkbox>
    <b-form-datepicker
      id="end-datepicker"
      v-model="localEmployee.endDate"
      :locale="isoLocale"
      class="mt-2 w-75 mb-2"
      :disabled="!!localEmployee.endDate"
      :label-no-date-selected="$t('noDate')"
    />
  </section>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, reactive, Ref, ref, useContext, watch} from "@nuxtjs/composition-api";
import {emailRegex} from "~/helpers/email";

interface EmployeeSettingsProps {
  employee: Employee,
}

export default defineComponent({
  props: {
    employee: {
      type: Object as PropType<Employee>,
      required: true,
    },
  },
  emits: ['update-selected-customers'],
  setup(props: EmployeeSettingsProps, {emit}) {
    const localEmployee: Ref<Employee> = reactive<Employee>(props.employee)
    const {i18n} = useContext();

    const isAdmin = true;
    const isoLocale = computed(() => i18n.localeProperties.iso);
    const hasEndDate = ref<boolean>(!!localEmployee.endDate);
    const emailTouched = ref<boolean | null>(null);
    const nameTouched = ref<boolean | null>(null);

    const emailValidationState = computed(() => {
      if (!emailTouched.value) {
        return null;
      } else {
        return localEmployee.email.match(emailRegex)
      }
    });

    const nameValidationState = computed(() => {
      if (!nameTouched.value) {
        return null;
      } else {
        return !!localEmployee.name
      }
    });


    watch(localEmployee, () => {
      console.log(localEmployee)
    });
    // id: string;
    // name: string;
    // email: string;
    // picture: string;
    // travelAllowance: boolean;
    // projects: string[];
    // endDate: number | null;
    // startDate: number;
    // created: number;
    // bridgeUid?: string;
    // team?: string;
    // standBy: boolean;

    return {
      localEmployee,
      hasEndDate,
      isoLocale,
      isAdmin,
      // isAdmin,
      // standbyAllowed,
      // name,
      nameValidationState,
      nameTouched,
      // email,
      emailValidationState,
      emailTouched,
      // isTravelAllowed,
      // isoLocale,
      // startDate,
      // hasEndDate,
      // endDate,
    }
  },
});
</script>

<style scoped></style>
