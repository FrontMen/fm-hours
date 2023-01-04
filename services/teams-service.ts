import Service from './Service';
import RepositoryManager, {Team} from '~/repositories';

export default class TeamsService extends Service<Team> {
  constructor(repositories: RepositoryManager) {
    super(repositories, repositories.teams);
  }
}
