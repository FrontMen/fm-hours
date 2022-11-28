<i18n lang="yaml">
en:
  searchName: "Search for customers"
  searchPlaceholderName: "E.g. iO Digital"
  showArchived: "Show archived"
  newCustomer: "New Customer"
  manageCustomer: "Manage Customer"
  default: "Default"
  yes: "Yes"
  no: "No"
  archived: "Archived"
  contract: "Contract"
nl:
  searchName: "Zoeken op klanten"
  searchPlaceholderName: "Bijv. iO Digital"
  showArchived: "Laat archief ook zien"
  newCustomer: "Nieuwe klant"
  manageCustomer: "Klant bewerken"
  default: "Standaard"
  yes: "Ja"
  no: "Nee"
  archived: "Gearchiveerd"
  contract: "Contract"
</i18n>

<template>
  <div class="content-wrapper mt-5">
    <b-container fluid class="mb-3">
      <b-row class="justify-content-between">
        <b-col cols="6" md="auto" class="pl-0 mb-3">
          <label class="col-form-label employee-status__label text-bold" for="employee-search">
            {{ $t('searchName') }}:
          </label>
          <b-input
            id="employee-search"
            v-model="searchTerm"
            type="search"
            :placeholder="$t('searchPlaceholderName')"
          />
        </b-col>
        <b-col cols="auto">
          <div class="d-flex justify-content-between align-items-center mt-1">
            <b-form-checkbox v-model="selectedArchiveOption" switch class="mr-3 ml-auto">
              {{ $t('showArchived') }}
            </b-form-checkbox>
            <nuxt-link class="btn btn-primary" :to="localePath(`/admin/customers/add`)">
              {{ $t('newCustomer') }}
              <b-icon icon="person" />
            </nuxt-link>
          </div>
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
        :items="filteredCustomers"
        :fields="fields"
        :sort-compare="sortCompare"
        :sort-desc.sync="sortDescending"
        :sort-by.sync="sortKey"
        no-sort-reset
      >
        <template #head()="data">
          <div>
            {{ $t(data.label) }}
          </div>
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
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, useContext, useMeta, useStore,} from "@nuxtjs/composition-api";
import {queryOnString, sortByProp} from "~/helpers/helpers";

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

    const searchTerm = ref<string>('');
    const selectedArchiveOption = ref<boolean>(false);
    const sortDescending = ref<boolean>(false);
    const sortKey = ref<string>('');
    const fields = [
      {key: "name", label: "customers", sortable: true},
      {key: "archived", label: "archived", sortable: false, class: 'text-center'},
      {key: "isDefault", label: "default", sortable: false, class: 'text-center'},
      {key: "contract", label: "contract", sortable: false, formatter: (value: Contract) => value ? value.name : '-'},
      {key: "actions", label: "actions", sortable: false, class: 'text-right'},
    ];

    const checkCustomerNotArchived = (archived: boolean, customer: Customer) => {
      if (archived) return true;

      return !customer.archived;
    }

    const checkCustomerProp = (query: string, filterByProp: keyof Customer, customer: Customer) => {
      if (!query || !customer) return true;
      if (!customer[filterByProp]) return;

      return queryOnString(customer[filterByProp] as string, query);
    }

    const filteredCustomers = computed(() =>
      customers.value.filter((customer) => (
        checkCustomerNotArchived(selectedArchiveOption.value, customer) &&
        checkCustomerProp(searchTerm.value, 'name', customer)
      )));

    const sortCompare = (a: Customer, b: Customer, key: keyof Customer) => sortByProp<Customer>(a, b, key);

    return {
      fields,
      sortCompare,
      sortDescending,
      sortKey,
      filteredCustomers,
      searchTerm,
      selectedArchiveOption,
    };
  },
  head: {},
});
</script>
