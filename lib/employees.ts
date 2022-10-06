import {DocumentSnapshot} from '@firebase/firestore-types';
import {Employee} from '../interfaces/employee';

export function mapEmployeeFromDocument(doc: DocumentSnapshot): Employee {
  return {
    id: doc.id,
    ...(doc.data() as Omit<Employee, 'id'>),
  };
}
