<i18n lang="yaml">
en:
  manageProjects: "Manage Projects"
  removeContract: "Remove contract"
nl:
  manageProjects: "Projecten bewerken"
  removeContract: "Verwijder contract"
</i18n>

<template>
  <section>
    <h6 class="mb-3">{{ $t('manageProjects') }}</h6>
    <b-input-group class="mb-2">
      <b-form-select v-model="customerToAdd" :options="customersSelectList"></b-form-select>
      <b-input-group-append>
        <b-button :disabled="!customerToAdd" @click="customerAddClick">Add</b-button>
      </b-input-group-append>
    </b-input-group>

    <b-table
      :items="selectedProjects"
      :fields="fields"
      class="rounded"
      small
      striped
      table-variant="light"
    >
      <template #cell(contract)="data">
        <div v-if="data.item.contract">
          <b-button size="sm" @click="handleOpenContract(data.item)">
            <b-icon-eye />
          </b-button>
        </div>
        <div v-else>
          <b-button
            v-b-modal.select-contract
            size="sm"
            variant="success"
            @click="selectedCustomer = data.item"
          >
            <b-icon-plus />
          </b-button>
        </div>
      </template>
      <template #cell(delete)="row">
        <b-button
          size="sm"
          variant="danger"
          :disabled="row.item.isDefault"
          @click="handleProjectDelete(row.item.customer.id)"
        >
          <b-icon-trash-fill />
        </b-button>
      </template>
    </b-table>

    <contract-selector id="select-contract" @selected="handleContractSelected"></contract-selector>

    <b-modal ref="viewContractModal" ok-only>
      <b-button size="sm" variant="danger" @click="handleContractDelete(selectedProject)">
        <b-icon-trash-fill />
        {{ $t('removeContract') }}
      </b-button>
      <pre v-if="selectedProject">
        {{ selectedProject.contract }}
      </pre>
    </b-modal>
  </section>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, ref, SetupContext, useContext} from "@nuxtjs/composition-api";
import {BModal} from "bootstrap-vue";

interface ProjectSelectorProps {
  selectedProjects: Project[],
  customers: Customer[]
}

export default defineComponent({
  props: {
    selectedProjects: {
      type: Array as PropType<Project[]>,
      required: true,
      default: () => []
    },
    customers: {
      type: Array,
      required: true,
      default: () => []
    },
  },
  emits: ['update-selected-projects'],
  setup(props: ProjectSelectorProps, {emit}: SetupContext) {
    const {i18n} = useContext();

    const handleProjectDelete = (projectId: string) => {
      const newList = props.selectedProjects.filter(({customer}) => customer.id !== projectId);

      emit('update-selected-projects', newList);
    }

    const customerToAdd = ref<Customer | null>(null);
    const customersSelectList = computed(() => {
      const customerList = props.customers
        .filter((customer) => !customer.isDefault && !customer.archived)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((customer) => ({
          value: customer,
          text: `${customer.name} - ${customer.debtor}`,
          disabled: props.selectedProjects.some((project) => project.customer.id === customer.id)
        }))

      return [
        {value: undefined, text: i18n.t('selectCustomer')},
        ...customerList
      ]
    });
    const customerAddClick = () => {
      if (!customerToAdd.value) return;

      emit('update-selected-projects', [
        ...props.selectedProjects,
        {
          customer: customerToAdd.value,
          contract: null
        } as Project
      ])

      customerToAdd.value = null;
    }

    const selectedProject = ref<Project>();
    const selectedCustomer = ref();

    const handleContractSelected = (contract: Contract) => {
      const newList = props.selectedProjects.map((record) => {
        if (record.customer.id === selectedCustomer.value.customer.id) {
          return {
            ...record,
            contract
          }
        }
        return record;
      });

      selectedCustomer.value = undefined;

      emit('update-selected-projects', newList);
    }

    const viewContractModal = ref<InstanceType<typeof BModal> | null>(null);
    const handleOpenContract = (project: Project) => {
      selectedProject.value = project;
      viewContractModal.value?.show();
    }

    const handleContractDelete = (project: Project) => {
      const newList = props.selectedProjects.map((record) => {
        if (record.customer.id === project.customer.id) {
          return {
            ...record,
            contract: null
          }
        }
        return record;
      });

      emit('update-selected-projects', newList);
      viewContractModal.value?.hide();
    }

    const fields = [
      {key: 'customer.name', label: 'Customer'},
      {key: 'customer.debtor', label: 'Debtor'},
      {key: 'contract', class: 'text-center'},
      {key: 'delete', class: 'text-center'}
    ];

    return {
      customerToAdd,
      customersSelectList,
      customerAddClick,
      selectedProject,
      selectedCustomer,
      handleProjectDelete,
      handleContractSelected,
      fields,
      handleOpenContract,
      viewContractModal,
      handleContractDelete
    }
  },
});
</script>

<style scoped></style>
