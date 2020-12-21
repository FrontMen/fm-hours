<template>
  <b-row>
    <b-col>
      <div class="table-row">
        <div
          class="d-flex align-items-center table-row__col table-row__col-left"
        >
          <slot name="col1" />
        </div>
        <div class="d-flex table-row__col table-row__col-center">
          <slot name="col2" />
        </div>
        <div class="table-row__col table-row__col-right">
          <slot name="col3" />
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<style scoped lang="scss">
.table-row {
  display: flex;

  &__col-left {
    width: 30%;
  }
  &__col-center {
    width: 60%;
    padding: 0 20px;

    > div {
      margin-right: 24px;
      text-align: center;
      flex: 1 1 0px;
      &:last-child {
        margin-right: 0;
      }
    }
  }
  &__col-right {
    width: 10%;
    text-align: right;
    min-width: 120px;
  }
}

@media (max-width: 998px) {
  .table-row {
    &__col-left {
      width: 25%;
    }

    &__col-center {
      padding: 0 10px;
      > div {
        margin-right: 12px;
      }
    }
  }
}
@media (max-width: 767px) {
  .table-row {
    flex-flow: row wrap;

    .table-row__col {
      width: 100%;
    }
    &__col-center {
      padding: 14px 0;
      > div {
        text-align: center;
      }
    }

    &__right {
      text-align: left;
    }
  }
}
</style>
