<template>
  <div class="layout-wrapper">
    <Nuxt />
  </div>
</template>

<style lang="scss">
@import 'node_modules/bootstrap/scss/bootstrap';

.layout-wrapper {
  padding: 0 20px;
}

@media (min-width: map-get($grid-breakpoints, xs)) and (max-width: map-get($grid-breakpoints, md)) {
  .layout-wrapper {
    padding: 0 10px;
  }

  .row > .col,
  .row > [class*="col-"] {
    padding-right: 5px;
    padding-left: 5px;
  }
}
</style>
