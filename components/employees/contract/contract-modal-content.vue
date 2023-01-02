<i18n lang="yaml">
en:
  general_heading: General
  name: Name
  company: Company
  group: Group
  active: Active
  project_heading: Project
  key: Key
  lead: Lead
  billing_heading: Billing
  entity: Entity
  contact: Contact
nl:
  general_heading: Algemeen
  name: Naam
  company: Bedrijf
  group: Groep
  active: Actief
  project_heading: Project
  key: Code
  lead: Leider
  billing_heading: Facturatie
  entity: Entiteit
  contact: Contact
</i18n>

<template>
  <div>
    <h5>{{ $t('general_heading') }}</h5>
    <dl class="row mb-4">
      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('name') }}</dt>
      <dd class="col-sm-10">
        <external-link :href="`${bridgeUrl}/contract/${contract.id}`">
          {{ contract.name }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('company') }}</dt>
      <dd class="col-sm-10">
        <external-link :href="`${bridgeUrl}/company/${contract.company_id}`" target="_blank">
          {{ contract.company_name }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('group') }}</dt>
      <dd class="col-sm-10">{{ contract.group || '-' }}</dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('active') }}</dt>
      <dd class="col-sm-10">
        <b-icon-check-circle-fill v-if="contract.closed === null" variant="success" />
        <b-icon-x-circle v-else variant="danger" />
      </dd>
    </dl>

    <h5>{{ $t('project_heading') }}</h5>
    <dl class="row mb-4">
      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('name') }}</dt>
      <dd class="col-sm-10">
        <external-link :href="`${bridgeUrl}/project/${contract.project_id}`">
          {{ contract.project_name }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('key') }}</dt>
      <dd class="col-sm-10">{{ contract.project_key }}</dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('lead')}}</dt>
      <dd class="col-sm-10">{{ contract.projectlead }}</dd>
    </dl>

    <h5>{{ $t('billing_heading') }}</h5>
    <dl class="row">
      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('entity') }}</dt>
      <dd class="col-sm-10">
        <external-link :href="`${bridgeUrl}/billingcontact/${contract.project_billingentity_id}`">
          {{ contract.project_billingentity_name  }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('contact') }}</dt>
      <dd class="col-sm-10">{{ contract.billingcontact_name || '-' }}</dd>
    </dl>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
import ExternalLink from "~/components/employees/contract/external-link.vue";

export default defineComponent({
  name: 'ContractModalContent',
  components: {ExternalLink},
  props: {
    contract: {
      type: Object,
      required: true,
    },
    handleContractDelete: {
      type: Function,
      required: true,
    }
  },
  setup() {
    const bridgeUrl = 'https://bridge.hosted-tools.com'

    return {
      bridgeUrl,
    }
  }
})
</script>
