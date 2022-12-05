<i18n lang="yaml">
en:
  notFound: "Customer not found"
  enterName: "Enter name"
  contract: "Contract"
  contractDescription: "Only when every employee needs to write on the same contract use this!"
  viewContract: "View contract"
  selectContract: "Select a contract"
  removeContract: "Remove contract"
  archivedCustomer: "Customer is archived"
nl:
  notFound: "Klant niet gevonden"
  enterName: "Typ naam"
  contract: "Contract"
  contractDescription: "Gebruik dit alleen als elke werknemer op hetzelfde contract moet schrijven!"
  viewContract: "Contract bekijken"
  selectContract: "Selecteer een contract"
  removeContract: "Verwijder contract"
  archivedCustomer: "Klant is gearchiveerd"
</i18n>

<template>
  <div>
    <template v-if="!customer">
      <p>{{ $t('notFound') }}</p>
    </template>

    <template v-else>
      <div class="row">
        <b-form class="col-5" @submit.prevent="handleSubmit" @change="hasUnsavedChanges = true">
          <b-alert :show="form.archived" variant="info">
            {{ $t('archivedCustomer') }}
          </b-alert>
          <b-form-group id="input-group-name" :label="$t('name') + ':'" label-for="input-2">
            <b-form-input
              id="input-name"
              v-model="form.name"
              :placeholder="$t('enterName')"
              required
            />
          </b-form-group>

          <b-form-checkbox v-model="form.isBillable">
            {{ $t('billable') }}
          </b-form-checkbox>

          <b-form-checkbox v-model="form.isDefault">
            {{ $t('availableAll') }}
          </b-form-checkbox>

          <b-form-group :label="$t('contract') + ':'" class="mt-3">
            <b-alert :show="true" variant="warning" class="mb-3">
              {{ $t('contractDescription') }}
            </b-alert>

            <div v-if="form.contract">
              <p class="mb-1 text-muted">{{ form.contract.project_name }}</p>
              <p class="mb-0 text-muted">{{ form.contract.name }}</p>
              <b-button class="" size="sm" @click="handleContractOpen">
                <b-icon-eye />
                {{ $t('viewContract') }}
              </b-button>
            </div>
            <div v-else>
              <b-button v-b-modal.select-contract size="sm" variant="success">
                <b-icon-plus />
                {{ $t('selectContract') }}
              </b-button>
            </div>
          </b-form-group>

          <div class="d-flex justify-content-end mt-5">
            <b-button
              v-if="mode === 'edit'"
              type="button"
              variant="secondary"
              class="mr-2 text-capitalize"
              @click="archiveCustomerToggle(!form.archived)"
            >
              {{ form.archived ? $t('unarchive') : $t('archive') }}
              <b-icon icon="archive" class="ml-1" />
            </b-button>
            <b-button type="submit" variant="primary" :disabled="!hasUnsavedChanges">
              {{ $t('save') }}
              <b-icon icon="check2-circle" />
            </b-button>
          </div>
        </b-form>
      </div>
    </template>

    <contract-selector id="select-contract" @selected="handleContractSelected"></contract-selector>

    <b-modal ref="viewContractModal" ok-only>
      <b-button size="sm" variant="danger" @click="handleContractDelete">
        <b-icon-trash-fill />
        {{ $t('removeContract') }}
      </b-button>
      <pre v-if="form?.contract">
          {{ form.contract }}
        </pre
      >
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  useStore,
  useRouter,
  useMeta,
  watch,
  ref,
  useContext,
  PropType,
} from "@nuxtjs/composition-api";
import { BModal } from "bootstrap-vue";

export default defineComponent({
  props: {
    mode: {
      type: String,
      required: true,
      validator: (value: string) => {
        return ['add', 'edit'].includes(value)
      }
    },
    customer: {
      type: Object as PropType<Customer>,
      required: false,
      default: null
    }
  },
  setup(props: { mode: string, customer: Customer }) {
    const { i18n } = useContext();
    const router = useRouter();
    const store = useStore<RootStoreState>();
    const viewContractModal = ref<InstanceType<typeof BModal> | null>(null);

    const hasUnsavedChanges = ref<boolean>(false);
    const form = ref<Omit<Customer, 'id'>>({
      name: "",
      isBillable: false,
      isDefault: false,
      contract: undefined
    });

    watch(
      () => props.customer,
      () => {
        form.value = props.customer
          ? { ...props.customer }
          : {
            name: "",
            isBillable: false,
            isDefault: false,
            contract: undefined
          };
      },
      { immediate: true }
    );

    const pageTitle = computed(() =>
      props.customer ? `Customers - ${props.customer.name}` : "Customers"
    );
    useMeta(() => ({ title: pageTitle.value }));

    const archiveCustomerToggle = (archive: boolean) => {
      const archiveData = {
        archived: archive,
        ...(archive ? { archivedDate: Date.now() } : {}),
      };

      const confirmation = confirm(
        i18n.t('customerArchiveConfirmation', {
          name: props.customer?.name || '',
          state: archive ? i18n.t('archive') : i18n.t('unarchive')
        }) as string
      );

      if (!confirmation) return;

      store.dispatch("customers/updateCustomer", {
        ...props.customer,
        ...archiveData,
      });
    };

    const handleSubmit = () => {
      if (!hasUnsavedChanges) return;

      if (props.mode === 'edit') {
        if (props.customer?.isBillable !== form.value?.isBillable) {
          const confirmation = confirm(
            `Are you sure that you want to make ${props.customer?.name
            } ${props.customer?.isBillable ? 'not billabled' : 'billabled'}? Past timesheet will not reflect this change.`
          );

          if (!confirmation) return;
        }

        store.dispatch("customers/updateCustomer", {
          ...form.value,
          id: props.customer.id,
        });
      } else if (props.mode === 'add') {
        store.dispatch("customers/addNewCustomer", form.value);
      }

      hasUnsavedChanges.value = false;
      router.push("/admin/customers");
    };

    const handleContractSelected = (contract: Contract) => {
      form.value = {
        ...form.value,
        contract
      }
      hasUnsavedChanges.value = true
    }

    const handleContractOpen = () => {
      viewContractModal.value?.show();
    }
    const handleContractDelete = () => {
      form.value = {
        ...form.value,
        contract: undefined
      }
      hasUnsavedChanges.value = true
      viewContractModal.value?.hide();
    }

    return {
      hasUnsavedChanges,
      form,
      archiveCustomerToggle,
      handleSubmit,
      viewContractModal,
      handleContractSelected,
      handleContractDelete,
      handleContractOpen
    };
  },
  head: {},
});
</script>
