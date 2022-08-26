import {VercelRequest, VercelResponse} from '@vercel/node';
import {lazyFirestore} from '../../lib/db_manager';
import {RecordType} from '../../interfaces/time-record';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const firestore = await lazyFirestore();
    const {collection, employeeId, startDate, endDate} = req.query;
    let query = await firestore.collection(collection).where('employeeId', '==', employeeId);

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
  } catch (e: unknown) {}
};
