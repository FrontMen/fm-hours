import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';
import {RecordType} from '../../interfaces/time-record';

export default async (req: VercelRequest, res: VercelResponse) => {
  const firestore = await lazyFirestore();
  const {employeeId, startDate, endDate} = req.body;
  let query = await firestore.collection(Collections.TIMREC).where('employeeId', '==', employeeId);

  if (startDate) {
    query = query.where('date', '>=', new Date(+startDate).getTime());
  }

  if (endDate) {
    query = query.where('date', '<=', new Date(+endDate).getTime());
  }

  const snapshot = await query.get();

  const response = snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...(doc.data() as Omit<RecordType, 'id'>),
  }));

  return res.status(200).json(response);
};
