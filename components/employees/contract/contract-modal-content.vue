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
        <external-link :href="`${$config.bridgeUrl}/contract/${contract.id}`">
          {{ contract.name }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('company') }}</dt>
      <dd class="col-sm-10">
        <external-link :href="`${$config.bridgeUrl}/company/${contract.company_id}`">
          {{ contract.company_name }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('group') }}</dt>
      <dd class="col-sm-10">{{ contract.group_name || '-' }}</dd>

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
        <external-link :href="`${$config.bridgeUrl}/project/${contract.project_id}`">
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
        <external-link :href="`${$config.bridgeUrl}/billingcontact/${contract.billingcontact_id}`">
          {{ contract.project_billingentity_name  }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">{{ $t('contact') }}</dt>
      <dd class="col-sm-10">{{ contract.billingcontact_name || '-' }}</dd>
    </dl>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    contract: {
      type: Object as PropType<Contract>,
      required: true,
    }
  }
})
</script>
