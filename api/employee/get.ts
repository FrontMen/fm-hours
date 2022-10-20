import {VercelRequest, VercelResponse} from '@vercel/node';
import {FieldPath} from '@google-cloud/firestore';
import {mapEmployeeFromDocument} from '../../lib/employees';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(504).json({});
    }
    const firestore = await lazyFirestore();
    const employeeId = req.query.employeeId;
    const email = req.query.email as string;
    let result;

    let ref = await firestore.collection(Collections.EMPLOYEES);

    if (employeeId) {
      ref = ref.where(FieldPath.documentId(), '==', employeeId);
    }

    if (email) {
      const fmMail = email.replace('@iodigital.com', '@frontmen.nl');
      const ioMail = email.replace('@frontmen.nl', '@iodigital.com');

      ref = ref.where('email', 'in', [fmMail, ioMail]);
    }

    const snapshot = await ref.get();
    if ((employeeId || email) && !snapshot.empty) {
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
