<i18n lang="yaml">
en:
  newCustomer: "New Customer"
  manageCustomer: "Manage Customer"
  default: "Default"
  yes: "Yes"
  no: "No"
  archived: "Archived"
  contract: "Contract"
nl:
  newCustomer: "Nieuwe klant"
  manageCustomer: "Klant bewerken"
  default: "Standaard"
  yes: "Ja"
  no: "Nee"
  archived: "Gearchiveerd"
  contract: "Contract"
</i18n>

<template>
  <admin-container>
    <b-container fluid class="mb-3">
      <b-row class="justify-content-between">
        <b-col cols="6" md="auto" class="pl-0 d-flex align-items-center">
          <b-form-group class="mb-0 mr-4">
            <b-input-group>
              <b-input
                id="employee-search"
                v-model="filter"
                type="search"
                :placeholder="$t('filter')"
              />
              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">
                  {{ $t('clear') }}
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>

          <b-form-checkbox v-model="archived" switch>
            {{ $t('showArchived') }}
          </b-form-checkbox>
        </b-col>
        <b-col cols="auto">
          <nuxt-link class="btn btn-primary" :to="localePath(`/admin/customers/add`)">
            {{ $t('newCustomer') }}
            <b-icon icon="person" />
          </nuxt-link>
        </b-col>
      </b-row>
    </b-container>

    <b-container fluid class="mb-3">
      <b-table
        class="row"
        responsive
        striped
        hover
        small
        :items="items"
        :fields="fields"
        :filter="filter"
      >
        <template #head()="data">
          {{ $t(data.label) }}
        </template>

        <template #cell(archived)="scope">
          <b-badge :variant="scope.item.archived ? 'warning' : 'info'">
            {{ scope.item.archived ? $t('yes') : $t('no') }}
          </b-badge>
        </template>
        <template #cell(isDefault)="scope">
          <b-badge :variant="scope.item.isDefault ? 'warning' : 'info'">
            {{ scope.item.isDefault ? $t('yes') : $t('no') }}
          </b-badge>
        </template>

        <template #cell(actions)="scope">
          <nuxt-link
            :to="localePath(`/admin/customers/${scope.item.id}`)"
            class="btn btn-sm btn-primary align-self-center"
            :title="$t('manageCustomer')"
          >
            <b-icon icon="pencil-fill" />
          </nuxt-link>
        </template>
      </b-table>
    </b-container>
  </admin-container>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, useContext, useMeta, useStore,} from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
    const store = useStore<RootStoreState>();
    const customers = computed(() => store.state.customers.customers);

    useMeta(() => ({
      title: i18n.t('customers') as string,
    }));

    onMounted(() => {
      store.dispatch("customers/getCustomers");
    });

    const filter = ref<string>('');
    const archived = ref<boolean>(false);
    const fields = [
      {key: "name", label: "customers", sortable: true},
      {key: "archived", label: "archived", sortable: false, class: 'text-center'},
      {key: "isDefault", label: "default", sortable: false, class: 'text-center'},
      {key: "contract", label: "contract", sortable: false, formatter: (value: Contract) => value ? value.name : '-'},
      {key: "actions", label: "actions", sortable: false, class: 'text-right'},
    ];

    const items = computed(() => {
      return customers.value.filter((customer) => {
        return archived.value ? true : customer.archived !== true
      });
    });


    return {
      fields,
      items,
      filter,
      archived,
    };
  },
  head: {},
});
</script>
