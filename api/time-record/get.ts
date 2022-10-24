import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {RecordType} from '../../interfaces/time-record';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(504).json({});
    }
    const firestore = await lazyFirestore();
    const {startDate, endDate} = req.query;

    let ref = firestore.collection(Collections.TIMREC);
    if (startDate) ref = ref.where('date', '>=', parseInt(startDate as string));
    if (endDate) ref = ref.where('date', '<', parseInt(endDate as string));

    const snapshot = await ref.orderBy('date', 'asc').get();

    const result = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<RecordType, 'id'>),
    }));
    return res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json(e.message);
    }
  }
};
