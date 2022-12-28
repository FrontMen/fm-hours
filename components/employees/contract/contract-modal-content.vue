<template>
  <div>
    <h5>General</h5>
    <dl class="row mb-4">
      <dt class="col-sm-2 font-weight-normal text-black-50">Name</dt>
      <dd class="col-sm-10">
        <external-link :href="`${bridgeUrl}/contract/${contract.id}`">
          {{ contract.name }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">Company</dt>
      <dd class="col-sm-10">
        <external-link :href="`${bridgeUrl}/company/${contract.company_id}`" target="_blank">
          {{ contract.company_name }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">Group</dt>
      <dd class="col-sm-10">{{ contract.group || '-' }}</dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">Open</dt>
      <dd class="col-sm-10">
        <b-icon-check-circle-fill v-if="contract.closed === null" variant="success" />
        <b-icon-x-circle v-else variant="danger" />
      </dd>
    </dl>

    <h5>Project</h5>
    <dl class="row mb-4">
      <dt class="col-sm-2 font-weight-normal text-black-50">Name</dt>
      <dd class="col-sm-10">
        <external-link :href="`${bridgeUrl}/project/${contract.project_id}`">
          {{ contract.project_name }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">Key</dt>
      <dd class="col-sm-10">{{ contract.project_key }}</dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">Lead</dt>
      <dd class="col-sm-10">{{ contract.projectlead }}</dd>
    </dl>

    <h5>Billing</h5>
    <dl class="row">
      <dt class="col-sm-2 font-weight-normal text-black-50">Entity</dt>
      <dd class="col-sm-10">
        <external-link :href="`${bridgeUrl}/billingcontact/${contract.project_billingentity_id}`">
          {{ contract.project_billingentity_name  }}
        </external-link>
      </dd>

      <dt class="col-sm-2 font-weight-normal text-black-50">Contact</dt>
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
