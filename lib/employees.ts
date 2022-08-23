import {DocumentSnapshot} from '@firebase/firestore-types';

export function mapEmployeeFromDocument(doc: DocumentSnapshot): Employee {
  return {
    ...(doc.data() as Employee),
    id: doc.id,
  };
}
