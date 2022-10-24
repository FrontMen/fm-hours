import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {RecordType} from '../../interfaces/time-record';
import {Collections} from '../../types/enums';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const firestore = await lazyFirestore();
    const {employeeId, startDate, endDate} = req.query;
    let query = await firestore
      .collection(Collections.TIMREC)
      .where('employeeId', '==', employeeId);

    if (startDate) {
      query = query.where('date', '>=', parseInt(startDate as string));
    }

    if (endDate) {
      query = query.where('date', '<=', parseInt(endDate as string));
    }

    const snapshot = await query.get();

    const response = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...(doc.data() as Omit<RecordType, 'id'>),
    }));
    return res.status(200).json(response);
  } catch (e: unknown) {}
};
