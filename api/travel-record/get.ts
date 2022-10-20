import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';
import {TravelRecord} from '../../interfaces/travel-record';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(504);
    }
    const firestore = await lazyFirestore();
    const {startDate, endDate} = req.query;
    const snapshot = await firestore
      .collection(Collections.TRAVELREC)
      .where('date', '>=', parseInt(startDate as string))
      .where('date', '<=', parseInt(endDate as string))
      .orderBy('date', 'asc')
      .get();

    const result = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<TravelRecord, 'id'>),
    }));
    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json(e.message);
  }
};
