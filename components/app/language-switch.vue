<script lang="ts">
import {computed, defineComponent, useContext} from '@nuxtjs/composition-api';
import type {LocaleObject} from 'nuxt-i18n';

export default defineComponent({
  props: {
    isNav: {
      type: Boolean,
      default: false,
    },
  },
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
      return getLanguageSvgUrl(activeLocaleCode.value!);
    });

    return {
      availableLocalesToSelect,
      svgUrl,
      activeLocaleCode,
      getLanguageSvgUrl,
    };

    /**
     * Since the ~/assets is evaluated via webpack, we have to require
     * the asset URL to get it properly.
     * https://nuxtjs.org/docs/2.x/directory-structure/assets#images
     */
    function getLanguageSvgUrl(code: string) {
      return require(`~/assets/languages/${code}.svg`);
    }
  },
});
</script>

<template>
  <div class="d-inline-block" :class="$style.languageSwitcher">
    <component :is="isNav ? 'b-nav-item-dropdown' : 'b-dropdown'">
      <template #button-content>
        <b-icon icon="translate" class="d-none d-lg-inline-block"></b-icon>
        <span class="d-lg-none">{{ $t('switch') }}</span>
      </template>
      <b-dropdown-item
        v-for="locale in availableLocalesToSelect"
        :key="locale.code"
        :class="$style.link"
        :to="switchLocalePath(locale.code)"
      >
        {{ $t(`lang.${locale.code}`) }}
      </b-dropdown-item>
    </component>
  </div>
</template>

<style lang="scss" module>
.link {
  text-decoration: none;
}

.icon {
  width: 24px;
  cursor: default;
}
</style>

<i18n lang="yaml">
en:
  switch: "Change language"
  en: "English"
  nl: "Nederlands"
nl:
  switch: "Verander de taal"
  en: "English"
  nl: "Nederlands"
</i18n>
