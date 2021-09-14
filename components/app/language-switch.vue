<i18n lang="yaml">
  en:
    en: "English"
    nl: "Nederlands"
  nl:
    en: "English"
    nl: "Nederlands"
</i18n>

<template>
  <div class="d-inline-block language-switcher">
    <img :src="svgUrl" :alt="$t(`lang.${activeLocaleCode}`)" />
    <b-dropdown>
      <b-dropdown-item
        v-for="locale in availableLocalesToSelect"
        :key="locale.code"
      >
        <nuxt-link
          :key="locale.code"
          :to="switchLocalePath(locale.code)"
          :class="{ active: locale.isActiveLocale }"
        >
          <img
            :src="`/_nuxt/assets/languages/${locale.code}.svg`"
            alt="lang.${locale.code}"
          />
          {{ $t(`lang.${locale.code}`) }}
        </nuxt-link>
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, useContext} from '@nuxtjs/composition-api';
import type {LocaleObject} from 'nuxt-i18n';
export default defineComponent({
  setup() {
    const {i18n} = useContext();

    const availableLocales = computed(() =>
      (i18n.locales as LocaleObject[]).map((loc) => {
        return {
          code: loc.code,
          isActiveLocale: loc.code === i18n.locale,
        };
      })
    );

    const activeLocaleCode = computed(
      () => availableLocales.value.find((loc) => loc.isActiveLocale)?.code
    );

    const availableLocalesToSelect = computed(() =>
      availableLocales.value.filter((locale) => !locale.isActiveLocale)
    );

    const svgUrl = computed(() => {
      /**
       * Since the ~/assets is evaluated via webpack, we have to require
       * the asset URL to get it properly.
       * https://nuxtjs.org/docs/2.x/directory-structure/assets#images
       */
      const url = require(`~/assets/languages/${activeLocaleCode.value}.svg`);
      return url;
    });

    return {
      availableLocalesToSelect,
      svgUrl,
      activeLocaleCode,
    };
  },
});
</script>


<style lang="scss">
.language-switcher {
  img {
    width: 20px;
    cursor: default;
  }
}
</style>
