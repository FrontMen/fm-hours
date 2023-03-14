<i18n lang="yaml">
en:
  employeeSettings: "Employee Settings"
  email: "Email"
  admin: "Admin"
  standBy: "Standby"
  shouldWriteHours: "Billable"
  endDate: "End date"
  startDate: "Start date"
  noDate: "No date selected"
nl:
  employeeSettings: "Medewerker instellingen"
  email: "Email"
  admin: "Administrator"
  standBy: "Stand-by"
  shouldWriteHours: "Facturabel"
  endDate: "Eind datum"
  startDate: "Start datum"
  noDate: "Geen datum geselecteerd"
</i18n>

<template>
  <section>
    <h6 class="mb-3">{{ $t('employeeSettings') }}</h6>

    BridgeUid:
    <b-form-input
      v-model="localEmployee.bridgeUid"
      type="text"
      class="mt-2 w-25 mb-2"
      :trim="true"
      @input="$emit('changed')"
    />

    {{ $t('name') }}:
    <b-form-input
      v-model="localEmployee.name"
      type="text"
      class="mt-2 w-75 mb-2"
      :placeholder="$t('employeeName')"
      :trim="true"
      :state="nameValidationState"
      @input="$emit('changed')"
    />

    {{ $t('email') }}:
    <b-form-input
      v-model="localEmployee.email"
      type="email"
      class="mt-2 w-75 mb-2"
      :placeholder="$t('employeeEmail')"
      :state="emailValidationState"
      :trim="true"
      @input="$emit('changed')"
    />

    <b-form-checkbox
      v-model="localEmployee.isAdmin"
      switch
      class="mt-2 mr-3"
      @change="$emit('changed')"
    >
      {{ $t('admin') }}
    </b-form-checkbox>
    <b-form-checkbox
      v-model="localEmployee.travelAllowance"
      name="check-button"
      switch
      @change="$emit('changed')"
    >
      {{ $t('travelAllowance') }}
    </b-form-checkbox>
    <b-form-checkbox
      v-model="localEmployee.standBy"
      switch
      class="mt-2 mr-3"
      @change="$emit('changed')"
    >
      {{ $t('standBy') }}
    </b-form-checkbox>
    <b-form-checkbox
      v-model="localEmployee.billable"
      switch
      class="mt-2 mr-3"
      @change="$emit('changed')"
    >
      {{ $t('shouldWriteHours') }}
    </b-form-checkbox>
    <b-form-checkbox
      v-model="localEmployee.freelancer"
      switch
      class="mt-2 mr-3"
      @change="$emit('changed')"
    >
      {{ $t('freelancer') }}
    </b-form-checkbox>
    <label class="mt-2" for="start-datepicker">{{ $t('startDate') }}:</label>
    <b-form-datepicker
      id="start-datepicker"
      v-model="startDate"
      :locale="isoLocale"
      class="w-75 mb-2"
      :label-no-date-selected="$t('noDate')"
      @input="$emit('changed')"
    />
    <b-form-checkbox v-model="hasEndDate" name="check-button" switch @change="$emit('changed')">
      {{ $t('endDate') }}:
    </b-form-checkbox>
    <b-form-datepicker
      id="end-datepicker"
      v-model="endDate"
      :locale="isoLocale"
      class="mt-2 w-75 mb-2"
      :disabled="!hasEndDate"
      :label-no-date-selected="$t('noDate')"
      @input="$emit('changed')"
    />
  </section>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  SetupContext,
  toRefs,
  useContext,
  watch
} from "@nuxtjs/composition-api";
import {formatDate, getDayOnGMT} from "~/helpers/dates";

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
  emits: ['changed', 'error-state'],
  setup(props: EmployeeSettingsProps, {emit}: SetupContext) {
    const {employee: localEmployee} = toRefs(props)
    const {i18n} = useContext();

    const hasEndDate = ref<boolean>(!!localEmployee.value.endDate);
    const startDate = ref<string>(formatDate(getDayOnGMT(localEmployee.value.startDate)));
    const endDate = ref<string | null>(localEmployee.value.endDate ? formatDate(getDayOnGMT(localEmployee.value.endDate)) : null);
    const emailTouched = ref<boolean | null>(null);
    const nameTouched = ref<boolean | null>(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isoLocale = computed(() => i18n.localeProperties.iso);
    const emailValidationState = computed(() => !!localEmployee.value.email?.match(emailRegex));
    const nameValidationState = computed(() => !!localEmployee.value.name);

    const checkValidity = () => {
      if (!nameValidationState.value) {
        emit('error-state', {message: i18n.t('errorName')})
        return;
      }

      if (!emailValidationState.value) {
        emit('error-state', {message: i18n.t('errorEmail')})
        return;
      }

      if (!startDate.value) {
        emit('error-state', {message: i18n.t('errorStartDate')})
        return;
      }

      if (hasEndDate.value && !endDate.value) {
        emit('error-state', {message: i18n.t('errorEndDate')})
      }
    }

    watch(localEmployee, checkValidity)
    watch([startDate, endDate], checkValidity)

    watch(startDate, () => {
      localEmployee.value.startDate = new Date(startDate.value).getTime()
    });

    watch(endDate, () => {
      if (endDate.value) {
        localEmployee.value.endDate = new Date(endDate.value).getTime()
      }
    });

    return {
      localEmployee,
      hasEndDate,
      isoLocale,
      nameValidationState,
      nameTouched,
      emailValidationState,
      emailTouched,
      startDate,
      endDate,
    }
  },
});
</script>
