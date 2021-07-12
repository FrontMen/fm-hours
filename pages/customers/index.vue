<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <b-container class="mx-0 px-0 mb-3" fluid>
        <b-row :no-gutters="true">
          <b-col cols="6" md="3" class="mb-3">
            <label class="employee-status__label" for="status-select">
              Search by:
            </label>
            <b-form-select
              id="status-select"
              v-model="selectedCriteria"
              :options="searchCriteria"
            />
          </b-col>
          <b-col cols="6" md="4" class="pl-0 mb-3">
            <label class="employee-status__label" for="employee-search">
              Search:
            </label>
            <b-input
              id="employee-search"
              v-model="searchTerm"
              type="search"
              placeholder="Ex.: &quot;Frontmen&quot;"
            />
          </b-col>
          <b-col cols="12" md="5" class="ml-auto mt-4">
            <div class="d-flex justify-content-between align-items-center mt-1">
              <b-form-checkbox v-model="selectedArchiveOption" switch class=" mr-3 ml-auto">
                Show archived
              </b-form-checkbox>
              <b-button v-b-modal.modal-center>
                + New customer
              </b-button>
            </div>
          </b-col>
        </b-row>
      </b-container>
      <b-table
        class="mt-3 app-table timesheet-table"
        responsive
        head-variant="dark"
        :items="filteredCustomers"
        :fields="fields"
        :sort-compare="sortCompare"
        :sort-desc.sync="sortDescending"
        :sort-by.sync="sortKey"
        no-sort-reset
      >
        <!-- Only the columns we want to customize need to be added
        the ones that are missing are handled by default strategy -->
        <template #head(archived)="data">
          <div class="text-center">
            {{ data.label }}
          </div>
        </template>
        <template #head(actions)="data">
          <div class="text-right">
            {{ data.label }}
          </div>
        </template>

        <template #cell(customers)="scope">
          <strong>{{ scope.item.name }}</strong>
          <b-badge v-if="scope.item.isDefault">
            Default
          </b-badge>
        </template>
        <template #cell(archived)="scope">
          <div class="text-center">
            <b-badge :variant="scope.item.archived ? 'warning' : 'success'">
              {{ scope.item.archived ? "Yes" : "No" }}
            </b-badge>
          </div>
        </template>
        <template #cell(actions)="scope">
          <div class="text-right">
            <nuxt-link
              :to="`/customers/${scope.item.id}`"
              class="btn btn-primary align-self-center"
              title="Manage Customer"
            >
              Manage Customer
            </nuxt-link>
          </div>
        </template>
      </b-table>
    </div>
    <b-modal
      id="modal-center"
      centered
      title="Add a customer"
      cancel-variant="danger"
      :ok-disabled="!canAddCustomer"
      @ok="addCustomer()"
    >
      <b-form-input v-model="newCustomer.name" placeholder="Customer name" />
      <b-form-input
        v-model="newCustomer.debtor"
        placeholder="Debtor (only visible in reports)"
        class="mt-3"
      />
      <b-form-checkbox v-model="newCustomer.isBillable" class="mt-3">
        Billable
      </b-form-checkbox>
      <b-form-checkbox v-model="newCustomer.isDefault" class="mt-3">
        Available to all employeees
      </b-form-checkbox>
    </b-modal>
  </div>

</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
} from "@nuxtjs/composition-api";
import { queryOnString, sortByProp } from "~/helpers/helpers";

export default defineComponent({
  middleware: ["isAdmin"],

  head: {
    title: "Customers",
  },

  setup() {
    const store = useStore<RootStoreState>();
    const customers: {value: Customer[] | undefined} = computed(() => store.state.customers.customers);
    store.dispatch("customers/getCustomers");

    const searchTerm = ref<string>(store.getters['filters/getCustomerSearchTerm']);
    const searchCriteria: { value: "name"|"debtor"; text: string; }[] = [
      { value: "name", text: "Customer name" },
      { value: "debtor", text: "Debtor name" },
    ];

    const fields = [
      { key: 'name', label: 'Customers', sortable: true },
      { key: 'debtor', label: 'Debtors', sortable: true },
      { key: 'archived', label: 'Archived', sortable: false },
      { key: 'actions', label: 'Actions', sortable: false }
    ];
    const selectedCriteria = ref<"name"|"debtor">(store.getters['filters/getCustomerSearchCriteria']);
    const selectedArchiveOption= ref<boolean>(store.getters['filters/getIsCustomerArchived']);
    const sortDescending= ref<boolean>(store.getters['filters/getCustomerSortDescending']);
    const sortKey= ref<boolean>(store.getters['filters/getCustomerSortBy']);

    const handleFilterUpdates = () => {
      if (store.getters['filters/getIsCustomerArchived'] !== selectedArchiveOption.value) {
        store.dispatch("filters/updateCustomerIsArchived", selectedArchiveOption.value);
      }
      if (store.getters['filters/getCustomerSortBy'] !== sortKey.value) {
        store.dispatch("filters/updateCustomerSortBy", sortKey.value);
      }
      if (store.getters['filters/getCustomerSortDescending'] !== sortDescending.value) {
        store.dispatch("filters/updateCustomerSortDescending", sortDescending.value);
      }
      if (store.getters['filters/getCustomerSearchTerm'] !== searchTerm.value) {
        store.dispatch("filters/updateCustomerSearchTerm", searchTerm.value);
      }
      if (store.getters['filters/getCustomerSearchCriteria'] !== selectedCriteria.value) {
        store.dispatch("filters/updateCustomerSearchCriteria", selectedCriteria.value);
      }
    };

    const filteredCustomers = computed(() => {
      const criteria: "name"|"debtor" = selectedCriteria.value;

      handleFilterUpdates();

      const customerList = customers.value || [];

      const notArchived = selectedArchiveOption.value ? [...customerList] : customerList.filter((customer: Customer) => {
          return !customer.archived;
        });

      const filtered: Customer[] = !searchTerm.value ? [...notArchived] : notArchived?.filter((customer: Customer) => {
          if (!customer[criteria]) return customer;
          return queryOnString(customer[criteria], searchTerm.value);
        });

      return filtered;
    });

    const newCustomer = ref({
      name: "",
      debtor: "",
      isBillable: true,
      isDefault: false,
    });

    const canAddCustomer = computed(() => {
      const { name, debtor } = newCustomer.value;
      return name && debtor;
    });

    const addCustomer = () => {
      store.dispatch("customers/addNewCustomer", { ...newCustomer.value });

      newCustomer.value.name = "";
      newCustomer.value.debtor = "";
      newCustomer.value.isBillable = true;
      newCustomer.value.isDefault = false;
    };

    const sortCompare = (a: Customer, b: Customer, key: "name"|"debtor") => {
      return sortByProp<Customer>(a, b, key);
    }

    return {
      fields,
      sortCompare,
      sortDescending,
      sortKey,
      filteredCustomers,
      searchTerm,
      searchCriteria,
      selectedArchiveOption,
      selectedCriteria,
      newCustomer,
      canAddCustomer,
      addCustomer,
    };
  },
});
</script>
