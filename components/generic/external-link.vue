<template>
  <a class="text-body" v-bind="$attrs" target="_blank" v-on="$listeners">
    <slot />
    <b-icon-box-arrow-up-right />
  </a>
</template>
