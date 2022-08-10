<i18n lang="yaml">
en:
  title: "Consultancy hours"
  requestLeave: "Request leave"
  feedback: "Feedback"
  logout: "Logout"
nl:
  title: "Consultancy uren"
  requestLeave: "Verlof aanvragen"
  feedback: "Feedback"
  logout: "Uitloggen"
</i18n>

<template>
  <div class="top-bar hide-print">
    <b-navbar toggleable="lg" type="light" variant="light">
      <b-navbar-brand href="/">
        <img src="@/assets/images/logo-black.svg" alt="logo" @click="handleLogoClick" />
        {{ $t('title') }}
        <b-badge variant="danger">DEVELOPMENT</b-badge>
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item
            href="https://bridge.hosted-tools.com/myprofile/absences"
            target="_blank"
            rel="noreferrer"
          >
            {{ $t('requestLeave') }}
            <b-icon icon="box-arrow-up-right" class="ml-1" aria-hidden="true" />
          </b-nav-item>

          <b-nav-item-dropdown right :text="$t('insights')" class="mr-2">
            <b-dropdown-item :to="localePath(`/insights/${employeeId}/${year}/`)">
              {{ $t("year") }}
            </b-dropdown-item>
            <b-dropdown-item :to="localePath(`/insights/${employeeId}/${year}/${month}`)">
              {{ $t("month") }}
            </b-dropdown-item>
          </b-nav-item-dropdown>

          <LanguageSwitch class="mr-2" :is-nav="true" />

          <b-nav-item-dropdown right class="employee__dropdown">
            <template v-if="employee" #button-content>
              {{ employee.name }}
            </template>

            <b-dropdown-item
              href="https://docs.google.com/forms/d/e/1FAIpQLSdl99lxgE8VDMfHXX_O35Lm8JeJmgA-yDYmG5mMHGWWdT7PrQ/viewform?usp=sf_link"
              target="_blank"
            >
              {{ $t("feedback") }}
              <b-icon class="ml-1" icon="box-arrow-up-right" aria-hidden="true" />
            </b-dropdown-item>
            <b-dropdown-item @click="handleLogoutClick">
              {{ $t("logout") }}
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, SetupContext, useContext, useRouter} from '@nuxtjs/composition-api';

export default defineComponent({
  props: {
    employee: {
      type: Object as PropType<Employee>,
      default: null
    },
    isDev: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['logout'],
  setup(props, {emit}: SetupContext) {
    const router = useRouter();
    const {localePath} = useContext();

    const handleLogoClick = () => router.push(localePath('/'));
    const handleLogoutClick = () => emit('logout');

    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    const employeeId = computed(() => props.employee?.id)

    return {
      handleLogoClick,
      handleLogoutClick,
      employeeId,
      year,
      month
    };
  },
});
</script>

<style lang="scss" scoped>
@media print {
  .hide-print {
    visibility: hidden;
  }
}

.top-bar {
  background: var(--color-light-gray);

  img {
    width: 50px;
    max-height: 100%;
    cursor: pointer;
  }
}
</style>
