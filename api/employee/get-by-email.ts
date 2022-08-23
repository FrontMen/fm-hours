import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {mapEmployeeFromDocument} from '../../lib/employees';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const firestore = await lazyFirestore();
    const {email} = req.body;
    let result = null;
    // TODO: remove when migrated to iO mail
    const fmMail = email.replace('@iodigital.com', '@frontmen.nl');
    const ioMail = email.replace('@frontmen.nl', '@iodigital.com');

    const ref = await firestore
      .collection(Collections.EMPLOYEES)
      .where('email', 'in', [fmMail, ioMail]);

    const snapshot = await ref.get();

    if (!snapshot.empty) {
      result = mapEmployeeFromDocument(snapshot.docs[0]);
    }

    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
