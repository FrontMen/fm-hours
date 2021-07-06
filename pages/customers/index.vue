<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <b-container class="mx-0 px-0 mb-3" fluid>
        <b-row :no-gutters="true">
          <b-col cols="3">
            <label class="employee-status__label" for="status-select">
              Search by:
            </label>
            <b-form-select
              id="status-select"
              v-model="selectedCriteria"
              :options="searchCriteria"
            />
          </b-col>
          <b-col cols="4" class="pl-0">
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
          <b-col class="ml-auto mt-auto">
            <div class="d-flex justify-content-end">
              <b-button v-b-modal.modal-center>
                + New customer
              </b-button>
            </div>
          </b-col>
        </b-row>
      </b-container>
      <b-container fluid class="app-table mb-5">
        <b-row class="app-table__top-row py-3">
          <b-col>
            <span class="font-weight-bold">Customers</span>
          </b-col>
        </b-row>

        <b-row
          v-if="!filteredCustomers.length"
          class="app-table__row employee-row p-3 mr-0 align-items-center justify-content-center"
        >
          <b-icon-person-x class="mr-2" />
          No customers found.
        </b-row>

        <b-row
          v-for="customer in filteredCustomers"
          v-else
          :key="customer.id"
          class="app-table__row py-3"
        >
          <b-col>
            <div class="font-weight-bold">
              {{ customer.name }}
              <b-badge v-if="customer.isDefault">
                Default
              </b-badge>
            </div>
            <div>
              {{ customer.debtor }}
            </div>
          </b-col>

          <b-col cols-md="4" class="d-flex justify-content-end">
            <nuxt-link
              :to="`/customers/${customer.id}`"
              class="btn btn-primary align-self-center"
            >
              Manage Customer
            </nuxt-link>
          </b-col>
        </b-row>
      </b-container>
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
import { queryOnString } from "~/helpers/helpers";

export default defineComponent({
  middleware: ["isAdmin"],

  head: {
    title: "Customers",
  },

  setup() {
    const store = useStore<RootStoreState>();
    const customers = computed(() => store.state.customers.customers);
    store.dispatch("customers/getCustomers");

    const searchTerm = ref<string>("");
    const searchCriteria: { value: "name"|"debtor"; text: string; }[] = [
      { value: "name", text: "Customer name" },
      { value: "debtor", text: "Debtor name" },
    ];
    const selectedCriteria = ref<"name"|"debtor">(searchCriteria[0].value);

    const filteredCustomers = computed(() => {
      if (!searchTerm.value) return customers.value;

      const criteria: "name"|"debtor" = selectedCriteria.value;

      const filtered: Customer[] = customers.value?.filter((customer: Customer) => {
          if (!searchTerm.value || !customer[criteria]) return customer;
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

    return {
      filteredCustomers,
      searchTerm,
      searchCriteria,
      selectedCriteria,
      newCustomer,
      canAddCustomer,
      addCustomer,
    };
  },
});
</script>
