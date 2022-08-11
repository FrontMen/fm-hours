<i18n lang="yaml">
en:
  notFound: "Customer not found"
  enterName: "Enter name"
  onlyReports: "Only visible in reports"
  enterDebtor: "Enter debtor"
nl:
  notFound: "Klant niet gevonden"
  enterName: "Typ naam"
  onlyReports: "Alleen zichtbaar in rapportage"
  enterDebtor: "typ debiteurnaam"
</i18n>

<template>
  <div class="content-wrapper my-5">
    <div v-if="!customer">{{ $t('notFound') }}</div>

    <template v-else>
      <b-container class="mb-5">
        <div class="row">
          <div class="col-6 offset-3 mb-5">
            <nuxt-link :to="localePath('/admin/customers')" class="btn btn-primary">
              <b-icon class="mr-1" icon="arrow-left-short" aria-hidden="true" />
              {{ $t('customers') }}
            </nuxt-link>
          </div>
          <b-form
            class="col-6 offset-3"
            @submit.prevent="handleSubmit"
            @change="hasUnsavedChanges = true"
          >
            <b-alert :show="form.archived" variant="info">
              {{ $t('archivedCustomer', {time: formatDate(form.archivedDate)}) }}
            </b-alert>
            <b-form-group id="input-group-name" :label="$t('name') + ':'" label-for="input-2">
              <b-form-input
                id="input-name"
                v-model="form.name"
                :placeholder="$t('enterName')"
                required
              />
            </b-form-group>

            <b-form-group
              id="input-group-debtor"
              :label="$t('debtor') + ':'"
              label-for="input-debtor"
              :description="$t('onlyReports')"
            >
              <b-form-input
                id="input-debtor"
                v-model="form.debtor"
                :placeholder="$t('enterDebtor')"
                required
              />
            </b-form-group>

            <b-form-checkbox v-model="form.isBillable">
              {{ $t('billable') }}
            </b-form-checkbox>

            <b-form-checkbox v-model="form.isDefault">
              {{ $t('availableAll') }}
            </b-form-checkbox>

            <div class="d-flex justify-content-end mt-5">
              <b-button
                type="button"
                variant="secondary"
                class="mr-2 text-capitalize"
                @click="archiveCustomerToggle(!form.archived)"
              >
                {{ form.archived ? $t('unarchive') : $t('archive') }}
                <b-icon icon="archive" class="ml-1" />
              </b-button>
              <b-button type="submit" variant="primary" :disabled="!hasUnsavedChanges">
                {{ $t('update') }}
                <b-icon icon="check2-circle" />
              </b-button>
            </div>
          </b-form>
        </div>
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
  useContext,
} from "@nuxtjs/composition-api";
import {format} from "date-fns";

export default defineComponent({
  setup() {
    const {i18n} = useContext();
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
    const customer: { value: Customer | undefined } = computed(() => customers.value.find((x) => x.id === customerId));

    onMounted(() => {
      if (customers.value.length === 0) {
        store.dispatch("customers/getCustomers");
      }
    });

    watch(
      () => customer.value,
      () => {
        form.value = customer.value
          ? {...customer.value}
          : {
            name: "",
            debtor: "",
            isBillable: false,
            isDefault: false,
          };
      },
      {immediate: true}
    );

    const pageTitle = computed(() =>
      customer.value ? `Customers - ${customer.value.name}` : "Customers"
    );
    useMeta(() => ({title: pageTitle.value}));

    const archiveCustomerToggle = (archive: boolean) => {
      const archiveData = {
        archived: archive,
        ...(archive ? {archivedDate: Date.now()} : {}),
      };

      const confirmation = confirm(
        i18n.t('customerArchiveConfirmation', {
          name: customer.value?.name || '',
          state: archive ? i18n.t('archive') : i18n.t('unarchive')
        }) as string
      );

      if (!confirmation) return;

      store.dispatch("customers/updateCustomer", {
        ...customer.value,
        ...archiveData,
      });
    };

    const handleSubmit = () => {
      if (!hasUnsavedChanges) return;

      if (customer.value?.isBillable !== form.value?.isBillable) {
        const confirmation = confirm(
          `Are you sure that you want to make ${
            customer.value?.name
          } ${customer.value?.isBillable ? 'not billabled' : 'billabled'}? Past timesheet will not reflect this change.`
        );

        if (!confirmation) return;
      }

      store.dispatch("customers/updateCustomer", {
        ...form.value,
        id: customerId,
      });

      hasUnsavedChanges.value = false;
      router.push("/customers");
    };

    const formatDate = (date: string) => {
      if (!date) return '';
      return format(new Date(date), "dd MMMM yyyy");
    };

    return {
      customer,
      hasUnsavedChanges,
      form,
      archiveCustomerToggle,
      handleSubmit,
      formatDate,
    };
  },
  head: {},
});
</script>
