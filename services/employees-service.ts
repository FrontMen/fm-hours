import Service from './Service';
import RepositoryManager, {DocumentWithId, Employee, WhereTuple} from '~/repositories';

function buildMailOptions(email: string) {
  // TODO: remove when migrated to iO mail
  return [
    email.replace('@iodigital.com', '@frontmen.nl'),
    email.replace('@frontmen.nl', '@iodigital.com'),
  ];
}

function buildEmailQuery<T extends {email: string}>(email?: T['email']) {
  return [...(email ? [['email', 'in', buildMailOptions(email)] as WhereTuple<T>] : [])];
}

export default class EmployeesService extends Service<Employee> {
  // Cached because mutations are infrequent, yet fetches are very frequent
  admins: string[] = [];

  constructor(repositories: RepositoryManager) {
    super(repositories, repositories.employees);
  }

  async add(
    employee: Employee & {isAdmin?: boolean}
  ): Promise<DocumentWithId<Employee> & {isAdmin: boolean}> {
    const {isAdmin, ...rest} = employee;
    if (isAdmin) {
      await this.makeAdmin(employee);
    }

    const newEmployee = await this.repository.add(rest);
    return this.addIsAdmin(newEmployee);
  }

  async getAdmins() {
    if (!this.admins.length) {
      // The structure of this repository does not neatly map to an admin record
      const adminList = await this.repositories.adminList.getByIndex(0);
      this.admins = adminList?.admins || [];
    }
    return this.admins;
  }

  async getAll(): Promise<(DocumentWithId<Employee> & {isAdmin: boolean})[]> {
    const employees = await this.repository.all();
    return Promise.all(employees.map(this.addIsAdmin));
  }

  async getById(
    employeeId: string
  ): Promise<(DocumentWithId<Employee> & {isAdmin: boolean}) | null> {
    const employee = await this.repository.getById(employeeId);
    return employee ? this.addIsAdmin(employee) : null;
  }

  async getByMail(email: string) {
    const employees = await this.repository.getByQuery(buildEmailQuery(email));
    return employees[0] || null;
  }

  async update(employee: DocumentWithId<Employee> & {isAdmin?: boolean}): Promise<void> {
    const {id, isAdmin, ...rest} = employee;

    if (isAdmin) {
      await this.makeAdmin(employee);
    } else {
      await this.revokeAdmin(employee);
    }

    return this.repository.updateById(id, rest);
  }

  private async addIsAdmin(
    employee: DocumentWithId<Employee>
  ): Promise<typeof employee & {isAdmin: boolean}> {
    const admins = await this.getAdmins();

    const mailOptions = buildMailOptions(employee.email);
    return {
      ...employee,
      isAdmin: admins.some(mail => mailOptions.includes(mail)),
    };
  }

  private async makeAdmin({email}: Employee) {
    const {admins = [], id} = (await this.repositories.adminList.getByIndex(0)) || {};
    if (id) {
      await this.repositories.adminList.updateById(id, {
        admins: [...admins, email],
      });
      const {admins: updatedAdmins = []} = (await this.repositories.adminList.getByIndex(0)) || {};
      this.admins = updatedAdmins;
    }
  }

  private async revokeAdmin({email}: Employee) {
    const {admins = [], id} = (await this.repositories.adminList.getByIndex(0)) || {};
    const shouldUpdate =
      admins.length && admins.length !== admins.filter(a => a !== email).length;

    if (id && shouldUpdate) {
      await this.repositories.adminList.updateById(id, {
        admins: [...admins, email],
      });
      const {admins: updatedAdmins = []} = (await this.repositories.adminList.getByIndex(0)) || {};
      this.admins = updatedAdmins;
    }
  }
}
