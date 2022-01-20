<i18n lang="yaml">
en:
  manageProjects: "Manage Projects"
  customerSearchPlaceholder: "Click or search for a customer here"
nl:
  manageProjects: "Projecten bewerkern"
  customerSearchPlaceholder: "Klik of zoek naar een klant"
</i18n>

<template>
  <section>
    <h6 class="mb-3">{{ $t('manageProjects') }}</h6>
    <multiselect
      :value="selectedCustomers"
      track-by="id"
      label="label"
      class="mb-3"
      :options="customerOptions"
      :close-on-select="false"
      :multiple="true"
      :taggable="false"
      :placeholder="$t('customerSearchPlaceholder')"
      @input="$emit('update-selected-customers', $event)"
    >
      <template slot="selection" slot-scope="{values}">
        <span v-if="values.length" class="multiselect__single">
          {{ $t('noOptions', {num: values.length}) }}
        </span>
      </template>
    </multiselect>

    <b-table
      :items="selectedCustomers"
      :fields="['name', 'debtor', 'delete']"
      class="rounded"
      small
      striped
      table-variant="light"
    >
      <template #cell(delete)="row">
        <b-button
          size="sm"
          variant="danger"
          :disabled="row.item.isDefault"
          @click="handleProjectDelete(row.item.id)"
        >
          <b-icon-trash-fill />
        </b-button>
      </template>
    </b-table>
  </section>
</template>

<script lang="ts">
import {computed, defineComponent} from "@nuxtjs/composition-api";

interface ProjectSelectorProps {
  selectedCustomers: Customer[],
  customers: Customer[]
}

export default defineComponent({
  props: {
    selectedCustomers: {
      type: Array,
      required: true,
      default: () => []
    },
    customers: {
      type: Array,
      required: true,
      default: () => []
    },
  },
  emits: ['update-selected-customers'],
  setup(props: ProjectSelectorProps, {emit}) {
    const handleProjectDelete = (projectId: string) => {
      const newList = props.selectedCustomers.filter((customer: Customer) => customer.id !== projectId);

      emit('update-selected-customers', newList);
    }

    const customerOptions = computed(() =>
      props.customers
        .filter((customer) => !customer.isDefault && !customer.archived)
        .map((customer) => ({
          ...customer,
          label: `${customer.name} (${customer.debtor})`,
        }))
    );

    return {handleProjectDelete, customerOptions}
  },
});
</script>

<style scoped></style>
