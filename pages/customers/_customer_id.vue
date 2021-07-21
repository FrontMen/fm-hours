<template>
  <div class="content-wrapper my-5">
    <div v-if="!customer">Customer not found</div>

    <template v-else>
      <b-container class="mb-5">
        <div class="mb-5">
          <nuxt-link to="/customers" class="btn btn-primary">
            <b-icon class="mr-1" icon="chevron-left" aria-hidden="true" />
            Customers
          </nuxt-link>
        </div>
        <b-form
          @submit.prevent="handleSubmit"
          @change="hasUnsavedChanges = true"
        >
          <b-alert :show="form.archived" variant="info">
            This customer archived at
            {{ form.archivedDate | formatDate("dd MMMM yyyy") }}
          </b-alert>
          <b-form-group id="input-group-name" label="Name:" label-for="input-2">
            <b-form-input
              id="input-name"
              v-model="form.name"
              placeholder="Enter name"
              required
            />
          </b-form-group>

          <b-form-group
            id="input-group-debtor"
            label="Debtor:"
            label-for="input-debtor"
            description="Only visible in reports"
          >
            <b-form-input
              id="input-debtor"
              v-model="form.debtor"
              placeholder="Enter debtor"
              required
            />
          </b-form-group>

          <b-form-checkbox v-model="form.isBillable">
            Billable
          </b-form-checkbox>

          <b-form-checkbox v-model="form.isDefault">
            Available to all employeees
          </b-form-checkbox>

          <div class="d-flex justify-content-end mt-5">
            <b-button
              type="button"
              variant="danger"
              class="mr-2"
              @click="deleteCustomer"
            >
              Delete
            </b-button>
            <b-button
              type="button"
              variant="warning"
              class="mr-2"
              @click="archiveCustomerToggle(!form.archived)"
            >
              {{ form.archived ? "Unarchive" : "Archive" }}
            </b-button>
            <b-button
              type="submit"
              variant="primary"
              :disabled="!hasUnsavedChanges"
            >
              Update
            </b-button>
          </div>
        </b-form>
      </b-container>
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  useStore,
  useRouter,
  useMeta,
  watch,
  ref,
} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  head: {},
  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const hasUnsavedChanges = ref<boolean>(false);
    const form = ref({
      name: "",
      debtor: "",
      isBillable: false,
      isDefault: false,
    });

    const customerId = router.currentRoute.params.customer_id;
    const customers = computed(() => store.state.customers.customers);
    const customer: { value: Customer | undefined } = computed(() =>
      customers.value.find((x) => x.id === customerId)
    );

    onMounted(() => {
      if (customers.value.length === 0) {
        store.dispatch("customers/getCustomers");
      }
    });

    watch(
      () => customer.value,
      () => {
        form.value = customer.value
          ? { ...customer.value }
          : {
              name: "",
              debtor: "",
              isBillable: false,
              isDefault: false,
            };
      },
      { immediate: true }
    );

    const pageTitle = computed(() =>
      customer.value ? `Customers - ${customer.value.name}` : "Customers"
    );
    useMeta(() => ({ title: pageTitle.value }));

    const deleteCustomer = () => {
      const confirmation = confirm(
        `Are you sure that you want to delete ${customer.value?.name}?`
      );

      if (!confirmation) return;

      store.dispatch("customers/deleteCustomer", customerId);
      router.push("/customers");
    };

    const archiveCustomerToggle = (archive: boolean) => {
      const archiveData = {
        archived: archive,
        ...(archive ? { archivedDate: Date.now() } : {}),
      };

      const confirmation = confirm(
        `Are you sure that you want to ${archive ? "archive" : "unarchive"} ${
          customer.value?.name
        }?`
      );

      if (!confirmation) return;

      store.dispatch("customers/updateCustomer", {
        ...customer.value,
        ...archiveData,
      });
    };

    const handleSubmit = () => {
      if (!hasUnsavedChanges) return;
      store.dispatch("customers/updateCustomer", {
        ...form.value,
        id: customerId,
      });

      hasUnsavedChanges.value = false;
      router.push("/customers");
    };

    return {
      customer,
      hasUnsavedChanges,
      form,
      archiveCustomerToggle,
      deleteCustomer,
      handleSubmit,
    };
  },
});
</script>
