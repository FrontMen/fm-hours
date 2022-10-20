import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {Collections} from '../../types/enums';
import {TravelRecord} from '../../interfaces/travel-record';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(504).json({});
    }
    const firestore = await lazyFirestore();
    const {employeeId, startDate, endDate} = req.query;

    const query = await firestore
      .collection(Collections.TRAVELREC)
      .where('employeeId', '==', employeeId);

    if (startDate) query.where('date', '>=', parseInt(startDate as string));

    if (endDate) query.where('date', '<=', parseInt(endDate as string));

    const snapshot = await query.get();

    const result = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<TravelRecord, 'id'>),
    }));

    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(500).json(e.message);
  }
};
