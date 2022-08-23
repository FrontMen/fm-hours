import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';
import {RecordType} from '../../interfaces/time-record';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const firestore = await lazyFirestore();
    const {startDate, endDate} = req.body;

    const snapshot = await firestore
      .collection(Collections.TIMREC)
      .where('date', '>=', startDate)
      .where('date', '<', endDate)
      .orderBy('date', 'asc')
      .get();

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
