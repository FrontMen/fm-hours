<i18n lang="yaml">
  en:
    en: "English"
    nl: "Nederlands"
  nl:
    en: "English"
    nl: "Nederlands"
</i18n>

<template>
  <div class="d-inline-block">
    <template v-for="locale in availableLocales">
      <nuxt-link
        v-if="locale && !locale.isActiveLocale"
        :key="locale.code"
        :to="switchLocalePath(locale.code)"
        class="text-white"
        :class="{ active: locale.isActiveLocale }"
      >
        {{ $t(`lang.${locale.code}`) }}
      </nuxt-link>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from "@nuxtjs/composition-api";
// eslint-disable-next-line import/named
import { LocaleObject } from "nuxt-i18n";
export default defineComponent({
  setup() {
    const { i18n } = useContext();
    const availableLocales = computed(() =>
      (i18n.locales as LocaleObject[]).map((loc: LocaleObject) => {
        return {
          code: loc.code,
          isActiveLocale: loc.code === i18n.locale,
        };
      })
    );
    return {
      availableLocales,
    };
  },
});
</script>
