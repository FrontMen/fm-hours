import type {NuxtAxiosInstance} from '@nuxtjs/axios';

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
