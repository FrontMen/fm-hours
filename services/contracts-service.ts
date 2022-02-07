import type {NuxtAxiosInstance} from '@nuxtjs/axios';

interface Contract {
  billingcontact_id: number;
  billingcontact_name: string;
  brand_group_id: number;
  brand_name: string;
  closed: boolean;
  company_id: number;
  company_name: string;
  group_name: string;
  id: number;
  jira_id: number;
  name: string;
  odoo_id: number;
  project_billingentity_id: string;
  project_billingentity_name: string;
  project_brand_id: string;
  project_id: number;
  project_jira_id: string;
  project_key: string;
  project_name: string;
  projectlead: string;
}

interface ContractListItemResult {
  [key: number]: Contract;
}

interface ContractListResult {
  numRows: number;
  contractList: Contract[];
}

export default class ContractsService {
  axios: NuxtAxiosInstance;
  readonly contractsEndpoint = 'api/bridge/contracts';

  constructor(axios: NuxtAxiosInstance) {
    this.axios = axios;
  }

  async getContracts(): Promise<unknown> {
    return await this.axios.get(this.contractsEndpoint);
  }

  async getContractByParam(
    abortControllerSignal: AbortSignal,
    params: {
      contractId?: number;
      jiraId?: string;
      projectId?: string;
      projectJiraId?: string;
      projectKey?: string;
      search?: string;
    }
  ): Promise<ContractListResult> {
    const axiosConfig = {
      signal: abortControllerSignal,
      params,
    };

    return await this.axios
      .get(this.contractsEndpoint, axiosConfig)
      .then(({data: result}) => result.data)
      .then((contractResult: {numrows: number; results: ContractListItemResult}) => ({
        numRows: contractResult.numrows,
        contractList: Object.values(contractResult.results),
      }));
  }
}
