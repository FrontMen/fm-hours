export default class WorkSchemeService {
  workSchemeRepository: IWorkSchemeRepository;

  constructor(workSchemeRepository: IWorkSchemeRepository) {
    this.workSchemeRepository = workSchemeRepository;
  }

  getWorkScheme(params: {
    bridgeUid: string;
    startDate: Date;
    endDate: Date;
  }): Promise<WorkScheme[]> {
    return this.workSchemeRepository.getWorkScheme(params);
  }
}
