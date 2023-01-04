import RepositoryManager, {DocumentData, DocumentWithId} from '~/repositories';
import Repository from '~/repositories/Repository';

export default class Service<T extends DocumentData = DocumentData> {
  repositories: RepositoryManager;
  repository: Repository<T>;

  constructor(repositories: RepositoryManager, repository: Repository<T>) {
    this.repositories = repositories;
    this.repository = repository;
  }

  getAll() {
    return this.repository.all();
  }

  getById(id: string) {
    return this.repository.getById(id);
  }

  getByIds(ids: string[]) {
    return this.repository.getByIds(ids);
  }

  add(resource: T) {
    return this.repository.add(resource);
  }

  update(resource: DocumentWithId<T>) {
    const {id, ...doc} = resource;
    return this.repository.updateById(id, doc as unknown as T); // TODO: fix type
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
