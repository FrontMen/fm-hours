import {VercelRequest, VercelResponse} from '@vercel/node';
import {mapEmployeeFromDocument} from '../../lib/employees';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // n.d.Max you need to limit the getAll query
    const firestore = await lazyFirestore();
    const {employeeId} = req.body;
    let result;
    const ref = await firestore.collection(Collections.EMPLOYEES);

    if (employeeId) {
      ref.where(firestore.FieldPath.documentId(), '==', employeeId);
    }
    const snapshot = await ref.get();
    if (employeeId && !snapshot.empty) {
      result = mapEmployeeFromDocument(snapshot.docs[0]);
    } else {
      result = snapshot.docs.map((res: any) => ({
        id: res.id,
        ...res.data(),
      }));
    }

    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
